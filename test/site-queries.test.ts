import type { Payload } from 'payload'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import * as data from '../seed/yes-hospital/data'
import { seedYesHospital } from '../seed/yes-hospital/seed'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import { getTestPayload, resetDb, rest } from './helpers'

/** Exactly what yes-hospital/src/lib/cms.ts requests, anonymously, for each collection it reads. */
export const siteQuery = (collection: string) => `/${collection}?where[tenant.slug][equals]=yes-hospital&depth=1&limit=0&sort=createdAt`

const expected: Record<string, number> = {
  'hospital-info': 1,
  departments: data.departments.length,
  doctors: 36,
  testimonials: data.testimonials.length,
  videos: data.videos.length,
  faqs: data.faqs.length,
  insurers: data.insurers.length,
  tpas: data.tpas.length,
  schemes: data.schemes.length,
}

let payload: Payload

beforeAll(async () => {
  await resetDb()
  payload = await getTestPayload()
  vi.stubEnv('SEED_REVALIDATE_URL', 'https://yes.test/api/revalidate')
  vi.stubEnv('SEED_WEBHOOK_SECRET', 'seed-secret')
  await seedYesHospital(payload)
  await notificationsSettled()
  vi.unstubAllEnvs()
}, 180_000)

describe("the site's anonymous queries", () => {
  test.each(Object.entries(expected))('%s returns 200 with every published doc', async (collection, count) => {
    const res = await rest(siteQuery(collection))
    const body = await res.json()
    expect(res.status, JSON.stringify(body)).toBe(200)
    expect(body.docs).toHaveLength(count)
  })

  test('doctors come with their department and photo populated', async () => {
    const { docs } = await (await rest(siteQuery('doctors'))).json()
    expect(docs.every((d: { department: unknown }) => typeof d.department === 'object')).toBe(true)
    const photos = docs.filter((d: { photo: unknown }) => d.photo)
    expect(photos).toHaveLength(13)
    for (const d of photos) expect(d.photo.sizes.card.url).toMatch(/\/api\/media\/file\/.+\.webp$/)
  })

  test('anonymous /api/tenants shows only public fields', async () => {
    const res = await rest('/tenants')
    expect(res.status).toBe(200)
    const [tenant] = (await res.json()).docs
    expect(Object.keys(tenant).sort()).toEqual(['createdAt', 'id', 'name', 'siteUrl', 'slug', 'updatedAt'])
  })
})
