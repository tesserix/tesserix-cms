import type { CollectionSlug, Payload } from 'payload'
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import * as data from '../seed/yes-hospital/data'
import { legacyBlogSlugs, legacyServiceSlugs } from '../seed/yes-hospital/redirects'
import { seedYesHospital } from '../seed/yes-hospital/seed'
import { getTestPayload, resetDb } from './helpers'

let payload: Payload
let tenant: number

const COLLECTIONS: CollectionSlug[] = ['tenants', 'media', 'hospital-info', 'departments', 'doctors', 'testimonials', 'videos', 'faqs', 'insurers', 'tpas', 'schemes']
const counts = async () =>
  Object.fromEntries(await Promise.all(COLLECTIONS.map(async (c) => [c, (await payload.count({ collection: c, overrideAccess: true })).totalDocs])))
/** What the public site sees: anonymous reads return published docs only. */
const live = <T>(collection: CollectionSlug) =>
  payload.find({ collection, where: { tenant: { equals: tenant } }, pagination: false, depth: 1, overrideAccess: false, user: null }).then((r) => r.docs as T[])

beforeAll(async () => {
  await resetDb()
  payload = await getTestPayload()
  vi.stubEnv('SEED_REVALIDATE_URL', 'https://yes.test/api/revalidate')
  vi.stubEnv('SEED_WEBHOOK_SECRET', 'seed-secret')
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))
  const sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
  ;({ tenant } = await seedYesHospital(payload))
  await notificationsSettled()
  // The seed publishes everything but must not ping the site or email anyone.
  expect(fetchMock).not.toHaveBeenCalled()
  expect(sendEmail).not.toHaveBeenCalled()
}, 180_000)

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('seed:yes-hospital', () => {
  test('creates the tenant', async () => {
    const t = await payload.findByID({ collection: 'tenants', id: tenant, overrideAccess: true })
    expect(t).toMatchObject({ slug: 'yes-hospital', name: 'YES Hospital & Research Centre', siteUrl: 'https://yeshospital.in', revalidateUrl: 'https://yes.test/api/revalidate', webhookSecret: 'seed-secret' })
  })

  test('publishes 36 doctors and every department, each doctor in its specialty', async () => {
    const departments = await live<{ id: number; name: string; slug: string; symptoms: string[] }>('departments')
    const doctors = await live<{ slug: string; department: { name: string }; photo?: { tenant: { id: number } | number } | null }>('doctors')
    expect(doctors).toHaveLength(36)
    expect(departments.map((d) => d.slug).sort()).toEqual(data.departments.map((d) => d.id).sort())
    const specialty = Object.fromEntries(data.doctors.map((d) => [d.id, d.specialty]))
    for (const d of doctors) expect(d.department.name).toBe(specialty[d.slug])
    expect(departments.every((d) => d.symptoms.length >= 3)).toBe(true)
    const withPhoto = doctors.filter((d) => d.photo)
    expect(withPhoto).toHaveLength(13)
    for (const d of withPhoto) expect(typeof d.photo!.tenant === 'object' ? d.photo!.tenant.id : d.photo!.tenant).toBe(tenant)
  })

  test('featured departments resolve, in homepage order', async () => {
    const featured = (await live<{ slug: string; featured: boolean; featuredOrder: number }>('departments')).filter((d) => d.featured)
    expect(featured.sort((a, b) => a.featuredOrder - b.featuredOrder).map((d) => d.slug)).toEqual(data.featuredDepartmentIds)
  })

  test('every legacy redirect target is a seeded department slug', async () => {
    const slugs = new Set((await live<{ slug: string }>('departments')).map((d) => d.slug))
    const missing = [...Object.values(legacyServiceSlugs), ...Object.values(legacyBlogSlugs)].filter((s) => !slugs.has(s))
    expect(missing).toEqual([])
  })

  test('seeds the rest of the content', async () => {
    expect((await live<{ youtubeId: string }>('videos')).map((v) => v.youtubeId).sort()).toEqual(data.videos.map((v) => v.id).sort())
    expect(await live('faqs')).toHaveLength(data.faqs.length)
    expect(await live('testimonials')).toHaveLength(data.testimonials.length)
    expect(await live('insurers')).toHaveLength(data.insurers.length)
    expect(await live('tpas')).toHaveLength(data.tpas.length)
    expect(await live('schemes')).toHaveLength(data.schemes.length)
    const [info] = await live<{ name: string; phones: string[] }>('hospital-info')
    expect(info).toMatchObject({ name: data.hospitalInfo.name, phones: data.hospitalInfo.phones })
  })

  test('running it again changes no counts', async () => {
    const before = await counts()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))
    await seedYesHospital(payload)
    expect(await counts()).toEqual(before)
  }, 180_000)
})
