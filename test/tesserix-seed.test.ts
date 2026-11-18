import type { CollectionSlug, Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import * as data from '../seed/tesserix/data'
import { seedTesserix } from '../seed/tesserix/seed'
import { as, getTestPayload, mkUser, resetDb, rest } from './helpers'

let payload: Payload
let tenant: number

const count = async (collection: CollectionSlug) => (await payload.count({ collection, where: { tenant: { equals: tenant } }, overrideAccess: true })).totalDocs
/** What the public site sees: anonymous reads return published docs only. */
const live = <T>(collection: CollectionSlug) =>
  payload.find({ collection, where: { tenant: { equals: tenant } }, pagination: false, depth: 1, sort: 'order', overrideAccess: false, user: null }).then((r) => r.docs as T[])

beforeAll(async () => {
  await resetDb()
  payload = await getTestPayload()
  vi.stubEnv('SEED_REVALIDATE_URL', 'https://tesserix.test/api/revalidate')
  vi.stubEnv('SEED_WEBHOOK_SECRET', 'seed-secret')
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))
  const sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
  ;({ tenant } = await seedTesserix(payload))
  await notificationsSettled()
  expect(fetchMock).not.toHaveBeenCalled()
  expect(sendEmail).not.toHaveBeenCalled()
}, 180_000)

afterAll(() => vi.unstubAllEnvs())

describe('seed:tesserix', () => {
  test('creates the tenant with its webhook settings', async () => {
    const t = await payload.findByID({ collection: 'tenants', id: tenant, overrideAccess: true })
    expect(t).toMatchObject({ slug: 'tesserix', name: 'Tesserix', siteUrl: 'https://tesserix.app', revalidateUrl: 'https://tesserix.test/api/revalidate', webhookSecret: 'seed-secret' })
  })

  test("publishes today's content, in order, with every image", async () => {
    expect(await count('products')).toBe(6)
    expect(await count('team-members')).toBe(2)
    expect(await count('principles')).toBe(4)
    expect(await count('beliefs')).toBe(3)
    expect(await count('open-source-projects')).toBe(4)
    expect(await count('media')).toBe(11)
    const products = await live<{ slug: string; status: string; siteImage?: { url: string } | null; screenshots?: { url: string }[] | null; listings: { platform: string; url: string }[] }>('products')
    expect(products.map((p) => p.slug)).toEqual(Object.keys(data.products))
    const mark8ly = products.find((p) => p.slug === 'mark8ly')!
    expect(mark8ly.siteImage?.url).toMatch(/\.jpg$/)
    expect(mark8ly.listings).toMatchObject([{ platform: 'ios', url: '' }, { platform: 'android' }])
    expect(products.find((p) => p.slug === 'roamie')!.screenshots).toHaveLength(3)
    expect(products.find((p) => p.slug === 'kora')!.status).toBe('coming-soon')
    const team = await live<{ slug: string; photo?: { url: string } | null }>('team-members')
    expect(team.map((m) => m.slug)).toEqual(data.team.map((m) => m.slug))
    expect(team.every((m) => m.photo?.url)).toBe(true)
  })

  test("the site's anonymous REST query returns 200 with the populated images", async () => {
    const res = await rest('/products?where[tenant.slug][equals]=tesserix&depth=1&limit=0&sort=order')
    const body = await res.json()
    expect(res.status, JSON.stringify(body).slice(0, 200)).toBe(200)
    expect(body.docs).toHaveLength(6)
    expect(body.docs[0].siteImage.url).toMatch(/\/api\/media\/file\/.+\.jpg$/)
  })

  test("a second run is skipped, and an approver's edit survives it", async () => {
    const approver = await mkUser('approver@tesserix.test', 'approver', [tenant])
    const mark8ly = (await payload.find({ collection: 'products', where: { slug: { equals: 'mark8ly' } }, overrideAccess: true })).docs[0]!
    await payload.update({ collection: 'products', id: mark8ly.id, data: { tagline: 'Edited in the CMS' }, ...as(approver) })
    await notificationsSettled()
    expect(await seedTesserix(payload)).toEqual({ tenant, skipped: true })
    const after = await payload.findByID({ collection: 'products', id: mark8ly.id, overrideAccess: true })
    expect(after.tagline).toBe('Edited in the CMS')
    expect(await count('media')).toBe(11)
  })
})
