import path from 'node:path'
import type { Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { User } from '../payload-types'
import { hiddenUnlessTenant } from '../src/access/roles'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import { as, getTestPayload, mkTenant, mkUser, resetDb } from './helpers'

let payload: Payload
let tesserix: number
let hospital: number
let approver: User
let editor: User
let hospitalUser: User

const photo = path.join(import.meta.dirname, '../seed/yes-hospital/photos/dr-kriti-sahu.jpg')

const product = (slug: string, order: number, extra: Record<string, unknown> = {}) => ({
  title: slug,
  slug,
  tagline: `${slug} tagline`,
  description: `${slug} description`,
  icon: 'Package',
  status: 'available',
  industry: 'commerce',
  order,
  tenant: tesserix,
  ...extra,
})

/** Exactly what tesserix-home/apps/web/lib/cms/client.ts asks for. */
const siteRead = (collection: 'products') =>
  payload.find({ collection, where: { 'tenant.slug': { equals: 'tesserix' } }, depth: 1, pagination: false, sort: 'order', overrideAccess: false, user: null })

beforeEach(async () => {
  await resetDb()
  payload = await getTestPayload()
  tesserix = await mkTenant('Tesserix', 'tesserix')
  hospital = await mkTenant('YES Hospital', 'yes-hospital')
  approver = await mkUser('approver@tesserix.test', 'approver', [tesserix])
  editor = await mkUser('editor@tesserix.test', 'editor', [tesserix])
  hospitalUser = await mkUser('editor@yes.test', 'editor', [hospital])
  vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
  vi.spyOn(payload.logger, 'info').mockImplementation(() => undefined as never)
})

afterEach(async () => {
  await notificationsSettled()
  vi.restoreAllMocks()
})

describe('products', () => {
  test('an editor saves a draft; the approver publishes; the site sees products in order with the site image populated', async () => {
    const image = await payload.create({ collection: 'media', data: { alt: 'Mark8ly storefront', tenant: tesserix }, filePath: photo, overrideAccess: true })
    const draft = await payload.create({ collection: 'products', data: product('mark8ly', 1, { siteImage: image.id }) as never, ...as(editor) })
    expect(draft._status).toBe('draft')
    expect((await siteRead('products')).docs).toHaveLength(0)

    await payload.update({ collection: 'products', id: draft.id, data: { _status: 'published' }, ...as(approver) })
    await payload.create({ collection: 'products', data: { ...product('aaa-later', 2), _status: 'published' } as never, ...as(approver) })
    await payload.create({ collection: 'products', data: { ...product('zzz-first', 0), _status: 'published' } as never, ...as(approver) })

    const { docs } = await siteRead('products')
    expect(docs.map((d) => d.slug)).toEqual(['zzz-first', 'mark8ly', 'aaa-later'])
    const m = docs.find((d) => d.slug === 'mark8ly')!
    expect(typeof m.siteImage).toBe('object')
    expect((m.siteImage as { url: string }).url).toMatch(/\.jpg$/)
    expect((m.siteImage as { width: number }).width).toBeGreaterThan(0)
  })

  test("another tenant's published products are not in the tesserix site query", async () => {
    await payload.create({ collection: 'products', data: { ...product('theirs', 1), tenant: hospital, _status: 'published' } as never, overrideAccess: true })
    await payload.create({ collection: 'products', data: { ...product('ours', 1), tenant: tesserix, _status: 'published' } as never, overrideAccess: true })
    expect((await siteRead('products')).docs.map((d) => d.slug)).toEqual(['ours'])
  })

  test('an icon outside the shared list fails validation', async () => {
    await expect(
      payload.create({ collection: 'products', data: { ...product('bad', 1, { icon: 'Rocket' }), _status: 'published' } as never, ...as(approver) }),
    ).rejects.toThrow(/icon/i)
  })

  test('the Tesserix admin group is hidden from a yes-hospital-only user and shown to a tesserix user', () => {
    const hidden = hiddenUnlessTenant('tesserix')
    expect(hidden({ user: hospitalUser })).toBe(true)
    expect(hidden({ user: editor })).toBe(false)
  })
})

describe('site content collections', () => {
  test('team members get a slug from the name; principles, beliefs and open-source projects publish with an order', async () => {
    const pub = { tenant: tesserix, _status: 'published' } as const
    const member = await payload.create({
      collection: 'team-members',
      data: { name: 'Mahesh Sangawar', title: 'Co-founder', linkedIn: 'https://linkedin.com/in/x', github: 'https://github.com/x', order: 1, ...pub },
      ...as(approver),
    })
    expect(member.slug).toBe('mahesh-sangawar')
    await payload.create({ collection: 'principles', data: { title: 'Small on purpose', body: 'b', order: 1, ...pub }, ...as(approver) })
    await payload.create({ collection: 'beliefs', data: { label: 'Humans reply', title: 'No chatbot queues', body: 'b', order: 1, ...pub }, ...as(approver) })
    await payload.create({ collection: 'open-source-projects', data: { name: 'sandboxctl', description: 'd', order: 1, ...pub }, ...as(approver) })
    for (const collection of ['principles', 'beliefs', 'open-source-projects'] as const) {
      const { docs } = await payload.find({ collection, where: { 'tenant.slug': { equals: 'tesserix' } }, overrideAccess: false, user: null })
      expect(docs, collection).toHaveLength(1)
    }
  })
})
