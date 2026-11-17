import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest'
import type { User } from '../payload-types'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import { as, getTestPayload, mkDepartment, mkTenant, mkUser, resetDb } from './helpers'

let payload: Payload
let tA: number
let tB: number
let approverA: User
let editorA: User
let dept: number
let fetchMock: MockInstance<typeof fetch>

const calls = () => fetchMock.mock.calls.map(([url, init]) => ({ url: String(url), init: init as RequestInit, body: JSON.parse(String((init as RequestInit).body)) }))
const mkDoctor = (data: Record<string, unknown>) =>
  payload.create({ collection: 'doctors', data: { department: dept, tenant: tA, ...data } as never })

beforeEach(async () => {
  await resetDb()
  payload = await getTestPayload()
  tA = await mkTenant('Hospital A', 'a')
  tB = await mkTenant('Hospital B', 'b')
  approverA = await mkUser('approver-a@test.dev', 'approver', [tA])
  editorA = await mkUser('editor-a@test.dev', 'editor', [tA])
  dept = await mkDepartment(tA, 'Cardiology')
  fetchMock = vi.mocked(fetch) as unknown as MockInstance<typeof fetch> // stubbed by test/setup.ts
  fetchMock.mockResolvedValue(new Response('ok'))
  await notificationsSettled()
  fetchMock.mockClear()
  vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
})

afterEach(async () => {
  await notificationsSettled()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('publish webhook', () => {
  test('publishing posts collection and slug with the tenant secret', async () => {
    await mkDoctor({ name: 'Dr X', slug: 'dr-x', _status: 'published' })
    await notificationsSettled()
    const [call] = calls().filter((c) => c.body.collection === 'doctors')
    expect(call!.url).toBe('https://a.test/api/revalidate')
    expect(call!.init.method).toBe('POST')
    expect(call!.init.headers).toMatchObject({ 'x-cms-secret': 'secret-a', 'content-type': 'application/json' })
    expect(call!.body).toEqual({ collection: 'doctors', slug: 'dr-x' })
    // A redirect is never followed, so the secret only ever goes to the configured URL.
    expect(call!.init.redirect).toBe('manual')
  })

  test('draft saves post nothing, including drafts of a published doc', async () => {
    const live = await mkDoctor({ name: 'Dr Live', slug: 'dr-live', _status: 'published' })
    await notificationsSettled()
    fetchMock.mockClear()
    await mkDoctor({ name: 'Dr Draft', slug: 'dr-draft' , _status: 'draft' } as never)
    const findByID = vi.spyOn(payload, 'findByID')
    await payload.update({ collection: 'doctors', id: live.id, draft: true, data: { name: 'edit' }, ...as(editorA) })
    await payload.update({ collection: 'doctors', id: live.id, draft: true, data: { name: 'edit 2' }, ...as(approverA) })
    await notificationsSettled()
    // Nothing went live, so the webhook does not even poll for the commit.
    // (notifyApprovers polls the draft for its email; the webhook would poll the live row.)
    expect(findByID.mock.calls.filter(([a]) => a.collection === 'doctors' && !a.draft)).toEqual([])
    await notificationsSettled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('unpublish and delete of a published doc post; a slug change also sends previousSlug', async () => {
    const a = await mkDoctor({ name: 'Dr A', slug: 'dr-a', _status: 'published' })
    const b = await mkDoctor({ name: 'Dr B', slug: 'dr-b', _status: 'published' })
    await notificationsSettled()
    fetchMock.mockClear()
    await payload.update({ collection: 'doctors', id: a.id, data: { _status: 'draft' }, ...as(approverA) })
    await notificationsSettled()
    expect(calls().map((c) => c.body)).toEqual([{ collection: 'doctors', slug: 'dr-a' }])
    fetchMock.mockClear()
    await payload.update({ collection: 'doctors', id: b.id, data: { slug: 'dr-b2', _status: 'published' }, ...as(approverA) })
    await notificationsSettled()
    expect(calls().map((c) => c.body)).toEqual([{ collection: 'doctors', slug: 'dr-b2', previousSlug: 'dr-b' }])
    fetchMock.mockClear()
    await payload.delete({ collection: 'doctors', id: b.id, ...as(approverA) })
    await notificationsSettled()
    expect(calls().map((c) => c.body)).toEqual([{ collection: 'doctors', slug: 'dr-b2' }])
  })

  test('slugless collections omit slug; tenants without a revalidateUrl are skipped', async () => {
    await payload.create({ collection: 'faqs', data: { question: 'q', answer: 'a', tenant: tA, _status: 'published' } as never })
    await notificationsSettled()
    expect(calls().filter((c) => c.body.collection === 'faqs').map((c) => c.body)).toEqual([{ collection: 'faqs' }])
    fetchMock.mockClear()
    await payload.update({ collection: 'tenants', id: tA, data: { revalidateUrl: '' } })
    await mkDoctor({ name: 'Dr Y', slug: 'dr-y', _status: 'published' })
    await notificationsSettled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test("tenant B's publish goes to B's URL with B's secret", async () => {
    const deptB = await mkDepartment(tB, 'Neuro')
    await notificationsSettled()
    const [call] = calls().filter((c) => c.body.collection === 'departments')
    expect(call!.url).toBe('https://b.test/api/revalidate')
    expect(call!.init.headers).toMatchObject({ 'x-cms-secret': 'secret-b' })
    expect(deptB).toBeTruthy()
  })

  test('a rejecting or hanging site never fails the publish, and the failure is logged without the secret', async () => {
    const logged = vi.spyOn(payload.logger, 'error').mockImplementation(() => undefined as never)
    fetchMock.mockRejectedValueOnce(new Error('site down'))
    const doc = await mkDoctor({ name: 'Dr Z', slug: 'dr-z', _status: 'published' })
    expect(doc._status).toBe('published')
    await notificationsSettled()
    expect(logged).toHaveBeenCalledOnce()
    expect(JSON.stringify(logged.mock.calls)).not.toContain('secret-a')
    expect(JSON.stringify(logged.mock.calls)).toContain('revalidateSite: a doctors')

    vi.stubEnv('REVALIDATE_TIMEOUT_MS', '50')
    fetchMock.mockImplementationOnce((_u: unknown, init?: RequestInit) => new Promise((_res, rej) => (init as RequestInit).signal!.addEventListener('abort', () => rej(new Error('aborted')))))
    await mkDoctor({ name: 'Dr W', slug: 'dr-w', _status: 'published' })
    await notificationsSettled()
    expect(logged).toHaveBeenCalledTimes(2)
  })

  test('a rolled-back publish posts nothing; a committed one posts after commit', async () => {
    const publish = async (slug: string) => {
      const req = await createLocalReq({ user: approverA }, payload)
      await initTransaction(req)
      await payload.create({ collection: 'doctors', data: { name: slug, slug, department: dept, tenant: tA, _status: 'published' }, req })
      return req
    }
    await killTransaction(await publish('rolled-back'))
    await notificationsSettled()
    expect(fetchMock).not.toHaveBeenCalled()
    const req = await publish('committed')
    await new Promise((r) => setTimeout(r, 300))
    expect(fetchMock).not.toHaveBeenCalled()
    await commitTransaction(req)
    await vi.waitFor(() => expect(calls().map((c) => c.body.slug)).toEqual(['committed']))
  })
})

describe('tenant revalidateUrl', () => {
  const setUrl = (revalidateUrl: string) => payload.update({ collection: 'tenants', id: tA, data: { revalidateUrl } })

  test('must be https, or http only for in-cluster service hosts', async () => {
    await expect(setUrl('https://a.test/api/revalidate')).resolves.toBeTruthy()
    await expect(setUrl('http://site.yes-hospital.svc.cluster.local:3000/api/revalidate')).resolves.toBeTruthy()
    await expect(setUrl('')).resolves.toBeTruthy()
    await expect(setUrl('http://a.test/api/revalidate')).rejects.toThrow(/revalidate URL/i)
    await expect(setUrl('http://evil.test/x.svc.cluster.local')).rejects.toThrow(/revalidate URL/i)
    await expect(setUrl('ftp://a.test/x')).rejects.toThrow(/revalidate URL/i)
    await expect(setUrl('not a url')).rejects.toThrow(/revalidate URL/i)
  })
})
