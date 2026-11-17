import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { User } from '../payload-types'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import { as, getTestPayload, mkDepartment, mkTenant, mkUser, resetDb, rest } from './helpers'

let payload: Payload
let tA: number
let superAdmin: User
let approverA: User
let editorA: User
let dept: number
let draftId: number
let publishedId: number

const liveName = async (id: number) => (await payload.findByID({ collection: 'doctors', id })).name
/** What the public site sees: published content, as an anonymous visitor. */
const publicNames = async () =>
  (await payload.find({ collection: 'doctors', draft: true, ...as(null) })).docs.map((d) => d.name).sort()

beforeEach(async () => {
  await resetDb()
  payload = await getTestPayload()
  tA = await mkTenant('Hospital A', 'a')
  superAdmin = await mkUser('root@test.dev', 'super-admin')
  approverA = await mkUser('approver-a@test.dev', 'approver', [tA])
  editorA = await mkUser('editor-a@test.dev', 'editor', [tA])
  dept = await mkDepartment(tA, 'Cardiology')
  draftId = (await payload.create({ collection: 'doctors', draft: true, data: { name: 'Dr Draft', department: dept, tenant: tA } })).id
  publishedId = (
    await payload.create({ collection: 'doctors', data: { name: 'Dr Live', department: dept, tenant: tA, _status: 'published' } })
  ).id
  vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
})

afterEach(async () => {
  // Detached approver emails from this test must not land on the next test's spy.
  await notificationsSettled()
  vi.restoreAllMocks()
})

describe('drafts and the publish gate', () => {
  test('an editor saving a draft succeeds and leaves the published version live', async () => {
    const doc = await payload.update({
      collection: 'doctors',
      id: publishedId,
      draft: true,
      data: { name: 'Dr Live (edited)' },
      ...as(editorA),
    })
    expect(doc._status).toBe('draft')
    expect(await liveName(publishedId)).toBe('Dr Live')
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('an editor write without draft: true still ends up as a draft', async () => {
    await payload.update({ collection: 'doctors', id: publishedId, data: { name: 'sneaky' }, ...as(editorA) })
    expect(await liveName(publishedId)).toBe('Dr Live')
    const created = await payload.create({ collection: 'doctors', data: { name: 'Dr New', department: dept, tenant: tA }, ...as(editorA) })
    expect(created._status).toBe('draft')
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('an editor update with _status published throws, with or without draft', async () => {
    for (const draft of [false, true]) {
      await expect(
        payload.update({
          collection: 'doctors',
          id: draftId,
          draft,
          data: { name: 'x', _status: 'published' },
          ...as(editorA),
        }),
      ).rejects.toThrow(/not allowed/i)
    }
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('an editor create with _status published throws', async () => {
    await expect(
      payload.create({ collection: 'doctors', data: { name: 'x', department: dept, tenant: tA, _status: 'published' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('an editor cannot unpublish: _status draft only saves a draft', async () => {
    const doc = await payload.update({ collection: 'doctors', id: publishedId, data: { _status: 'draft' }, ...as(editorA) })
    expect(doc._status).toBe('draft')
    expect(await publicNames()).toEqual(['Dr Live'])
    expect((await payload.findByID({ collection: 'doctors', id: publishedId }))._status).toBe('published')
  })

  test('REST: an editor PATCH with unpublishAllLocales leaves the live doc and its published version intact', async () => {
    const res = await rest(`/doctors/${publishedId}?unpublishAllLocales=true`, editorA, {
      method: 'PATCH',
      body: { name: 'Dr Live (edited)' },
    })
    expect(res.status).toBe(200)
    expect(await publicNames()).toEqual(['Dr Live'])
    const live = await payload.findByID({ collection: 'doctors', id: publishedId })
    expect(live).toMatchObject({ name: 'Dr Live', _status: 'published' })
    const versions = await payload.findVersions({ collection: 'doctors', where: { parent: { equals: publishedId } } })
    const published = versions.docs.filter((v) => v.version._status === 'published')
    expect(published.map((v) => v.version.name)).toEqual(['Dr Live'])
    await payload.update({ collection: 'doctors', id: publishedId, data: { name: 'Dr Live v3', _status: 'published' }, ...as(approverA) })
    await payload.restoreVersion({ collection: 'doctors', id: published[0]!.id, ...as(approverA) })
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('an editor bulk update by where cannot publish or change the live row', async () => {
    const where = { id: { in: [draftId, publishedId] } }
    await expect(
      payload.update({ collection: 'doctors', where, data: { _status: 'published' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
    const res = await payload.update({ collection: 'doctors', where, data: { opd: 'Sundays' }, ...as(editorA) })
    expect(res.errors).toEqual([])
    expect(res.docs.map((d) => d._status)).toEqual(['draft', 'draft'])
    expect(await publicNames()).toEqual(['Dr Live'])
    expect((await payload.findByID({ collection: 'doctors', id: publishedId })).opd).toBeFalsy()
  })

  test('an editor duplicating a published doc with a review note gets a draft', async () => {
    await payload.update({ collection: 'doctors', id: publishedId, data: { reviewNote: 'Approved' }, ...as(approverA) })
    const copy = await payload.duplicate({ collection: 'doctors', id: publishedId, ...as(editorA) })
    expect(copy._status).toBe('draft')
    expect(copy.reviewNote).toBeFalsy()
    expect(copy.slug).toBe('dr-live-copy')
    expect(await publicNames()).toEqual(['Dr Live'])
    // An approver's copy does not carry the source's review either.
    const copy2 = await payload.duplicate({ collection: 'doctors', id: publishedId, data: { slug: 'dr-live-2' }, ...as(approverA) })
    expect(copy2.reviewNote).toBeFalsy()
  })

  test('an approver of tenant A cannot publish a tenant B doc', async () => {
    const tB = await mkTenant('Hospital B', 'b')
    const deptB = await mkDepartment(tB, 'Cardiology')
    const docB = await payload.create({ collection: 'doctors', draft: true, data: { name: 'Dr B', department: deptB, tenant: tB } })
    await expect(
      payload.update({ collection: 'doctors', id: docB.id, data: { _status: 'published' }, ...as(approverA) }),
    ).rejects.toThrow(/not allowed/i)
    const res = await rest(`/doctors/${docB.id}`, approverA, { method: 'PATCH', body: { _status: 'published' } })
    expect(res.status).toBe(403)
    expect((await payload.findByID({ collection: 'doctors', id: docB.id }))._status).toBe('draft')
  })

  test('REST: an editor PATCH or POST with _status published is rejected', async () => {
    const patch = await rest(`/doctors/${draftId}`, editorA, { method: 'PATCH', body: { name: 'x', _status: 'published' } })
    expect(patch.status).toBe(403)
    const patchQ = await rest(`/doctors/${draftId}?draft=false`, editorA, { method: 'PATCH', body: { _status: 'published' } })
    expect(patchQ.status).toBe(403)
    const post = await rest('/doctors', editorA, { method: 'POST', body: { name: 'x', tenant: tA, _status: 'published' } })
    expect(post.status).toBe(403)
    // An editor's _status draft is just a draft save; the live row stays published.
    const unpublish = await rest(`/doctors/${publishedId}`, editorA, { method: 'PATCH', body: { _status: 'draft' } })
    expect(unpublish.status).toBe(200)
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('REST: an editor PATCH without a status saves a draft', async () => {
    const res = await rest(`/doctors/${publishedId}`, editorA, { method: 'PATCH', body: { name: 'Dr Live v2' } })
    expect(res.status).toBe(200)
    expect(await publicNames()).toEqual(['Dr Live'])
  })

  test('an approver publishes and succeeds', async () => {
    await payload.update({ collection: 'doctors', id: draftId, data: { _status: 'published' }, ...as(approverA) })
    const res = await rest(`/doctors/${publishedId}`, approverA, { method: 'PATCH', body: { name: 'Dr Live v2', _status: 'published' } })
    expect(res.status).toBe(200)
    expect(await publicNames()).toEqual(['Dr Draft', 'Dr Live v2'])
  })

  test("an editor's REST restore (draft=true) of a version with a different slug is refused once published", async () => {
    await payload.update({ collection: 'doctors', id: publishedId, data: { slug: 'renamed' }, ...as(approverA) })
    const versions = await payload.findVersions({ collection: 'doctors', where: { parent: { equals: publishedId } }, ...as(editorA) })
    const old = versions.docs.find((v) => v.version.slug === 'dr-live')!
    expect((await rest(`/doctors/versions/${old.id}?draft=true`, editorA, { method: 'POST' })).status).toBe(403)
    expect((await payload.findByID({ collection: 'doctors', id: publishedId })).slug).toBe('renamed')
  })

  test('an approver can unpublish', async () => {
    await payload.update({ collection: 'doctors', id: publishedId, data: { _status: 'draft' }, ...as(approverA) })
    expect(await publicNames()).toEqual([])
    expect((await payload.findByID({ collection: 'doctors', id: publishedId }))._status).toBe('draft')
  })

  test('an editor cannot restore a version to published; an approver can', async () => {
    await payload.update({ collection: 'doctors', id: publishedId, draft: true, data: { name: 'Dr Live v2' }, ...as(editorA) })
    const versions = await payload.findVersions({ collection: 'doctors', where: { parent: { equals: publishedId } }, ...as(editorA) })
    const live = versions.docs.find((v) => v.version._status === 'published')!
    const draft = versions.docs.find((v) => v.version._status === 'draft')!
    await expect(payload.restoreVersion({ collection: 'doctors', id: live.id, ...as(editorA) })).rejects.toThrow(/not allowed/i)
    // Restoring a draft version without draft: true would overwrite (unpublish) the live row.
    await expect(payload.restoreVersion({ collection: 'doctors', id: draft.id, ...as(editorA) })).rejects.toThrow(/not allowed/i)
    const restRes = await rest(`/doctors/versions/${live.id}`, editorA, { method: 'POST' })
    expect(restRes.status).toBe(403)
    expect(await publicNames()).toEqual(['Dr Live'])
    // Restoring as a draft is just another draft save. (The Local API ignores `draft` here; REST honours it.)
    expect((await rest(`/doctors/versions/${draft.id}?draft=true`, editorA, { method: 'POST' })).status).toBe(200)
    expect(await publicNames()).toEqual(['Dr Live'])
    // An approver restoring the old published version brings its content back live.
    await payload.update({ collection: 'doctors', id: publishedId, data: { name: 'Dr Live v3', _status: 'published' }, ...as(approverA) })
    expect(await publicNames()).toEqual(['Dr Live v3'])
    await payload.restoreVersion({ collection: 'doctors', id: live.id, ...as(approverA) })
    expect(await publicNames()).toEqual(['Dr Live'])
    expect(await liveName(publishedId)).toBe('Dr Live')
  })
})

describe('delete gate', () => {
  test('an editor delete throws and an approver delete succeeds', async () => {
    await expect(payload.delete({ collection: 'doctors', id: draftId, ...as(editorA) })).rejects.toThrow()
    expect((await rest(`/doctors/${publishedId}`, editorA, { method: 'DELETE' })).status).toBe(403)
    await payload.delete({ collection: 'doctors', id: draftId, ...as(approverA) })
    expect((await rest(`/doctors/${publishedId}`, approverA, { method: 'DELETE' })).status).toBe(200)
    expect(await payload.count({ collection: 'doctors' })).toEqual({ totalDocs: 0 })
  })
})

describe('anonymous reads', () => {
  test('anonymous find with draft: true returns only published content', async () => {
    await payload.update({ collection: 'doctors', id: publishedId, draft: true, data: { name: 'Dr Live (unreviewed)' }, ...as(editorA) })
    expect(await publicNames()).toEqual(['Dr Live'])
    expect((await payload.find({ collection: 'doctors', ...as(null) })).docs.map((d) => d.name)).toEqual(['Dr Live'])
    const res = await rest('/doctors?draft=true')
    expect(res.status).toBe(200)
    expect(((await res.json()) as { docs: { name: string }[] }).docs.map((d) => d.name)).toEqual(['Dr Live'])
    await expect(payload.findByID({ collection: 'doctors', id: draftId, draft: true, ...as(null) })).rejects.toThrow()
  })

  test('anonymous cannot read versions', async () => {
    await expect(payload.findVersions({ collection: 'doctors', ...as(null) })).rejects.toThrow()
    expect((await rest('/doctors/versions')).status).toBe(403)
  })
})

describe('reviewNote', () => {
  test('an editor updating reviewNote throws; an approver can set it', async () => {
    await expect(
      payload.update({ collection: 'doctors', id: draftId, draft: true, data: { reviewNote: 'lgtm' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
    await expect(
      payload.create({ collection: 'doctors', data: { name: 'x', department: dept, tenant: tA, reviewNote: 'self-approved' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
    const doc = await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { reviewNote: 'Fix the bio' }, ...as(approverA) })
    expect(doc.reviewNote).toBe('Fix the bio')
    // The admin form resubmits the note unchanged when an editor saves; that must still work.
    const edited = await payload.update({
      collection: 'doctors',
      id: draftId,
      draft: true,
      data: { name: 'Dr Draft v2', reviewNote: 'Fix the bio' },
      ...as(editorA),
    })
    expect(edited.reviewNote).toBe('Fix the bio')
  })
})

describe('notifyApprovers', () => {
  type Msg = { to: string; bcc: string[]; subject: string; text: string }
  const sent = () => vi.mocked(payload.sendEmail).mock.calls.map((c) => c[0] as Msg)
  const sentCount = (n: number) => vi.waitFor(() => expect(payload.sendEmail).toHaveBeenCalledTimes(n))
  const settle = notificationsSettled

  test('an editor draft save emails the tenant approvers by bcc, once per hour per document', async () => {
    vi.stubEnv('PAYLOAD_PUBLIC_SERVER_URL', 'https://cms.test') // independent of the developer's .env
    await mkUser('approver-a2@test.dev', 'approver', [tA])
    await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'Dr Draft v2' }, ...as(editorA) })
    await sentCount(1)
    await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'Dr Draft v3' }, ...as(editorA) })
    const msg = sent()[0]!
    expect(msg.to).toBe(payload.email.defaultFromAddress)
    expect([...msg.bcc].sort()).toEqual(['approver-a2@test.dev', 'approver-a@test.dev'])
    expect(msg.text).toContain('Hospital A')
    expect(msg.text).toContain('Dr Draft v2')
    expect(msg.text).toContain('editor-a@test.dev')
    expect(msg.text).toContain(`Review: https://cms.test/admin/collections/doctors/${draftId}`)

    // A different document gets its own email.
    await payload.update({ collection: 'doctors', id: publishedId, draft: true, data: { name: 'Dr Live v2' }, ...as(editorA) })
    await sentCount(2)
    vi.unstubAllEnvs()
  })

  test('the hour window reopens, and approver saves do not notify', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'v2' }, ...as(editorA) })
      await sentCount(1)
      vi.setSystemTime(Date.now() + 61 * 60 * 1000)
      await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'v3' }, ...as(editorA) })
      await sentCount(2)
    } finally {
      vi.useRealTimers()
    }
    await payload.update({ collection: 'doctors', id: publishedId, draft: true, data: { name: 'x' }, ...as(approverA) })
    await payload.update({ collection: 'doctors', id: publishedId, draft: true, data: { name: 'y' }, ...as(superAdmin) })
    await settle()
    expect(payload.sendEmail).toHaveBeenCalledTimes(2)
  })

  test('a failing email never fails the save, and does not use up the hour', async () => {
    vi.mocked(payload.sendEmail).mockRejectedValueOnce(new Error('resend down'))
    const logged = vi.spyOn(payload.logger, 'error').mockImplementation(() => undefined as never)
    const doc = await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'v2' }, ...as(editorA) })
    expect(doc.name).toBe('v2')
    await sentCount(1)
    await vi.waitFor(async () => expect(await payload.kv.get(`approval-notified:doctors:${draftId}`)).toBeNull())
    expect(logged.mock.calls.filter((c) => JSON.stringify(c).includes('notifyApprovers'))).toHaveLength(1)
    await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'v3' }, ...as(editorA) })
    await sentCount(2)
  })

  test('sends only after the transaction commits', async () => {
    const save = async (name: string) => {
      const req = await createLocalReq({ user: editorA }, payload)
      await initTransaction(req)
      await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name }, req, overrideAccess: false, user: editorA })
      return req
    }
    await killTransaction(await save('rolled back'))
    await settle()
    expect(payload.sendEmail).not.toHaveBeenCalled()

    const req = await save('committed')
    await new Promise((r) => setTimeout(r, 300))
    expect(payload.sendEmail).not.toHaveBeenCalled()
    await commitTransaction(req)
    await sentCount(1)
    expect(sent()[0]!.text).toContain('committed')
  })

  test('without an absolute server URL the link line is left out', async () => {
    vi.stubEnv('PAYLOAD_PUBLIC_SERVER_URL', '')
    const warn = vi.spyOn(payload.logger, 'warn')
    try {
      await payload.update({ collection: 'doctors', id: draftId, draft: true, data: { name: 'v2' }, ...as(editorA) })
      await sentCount(1)
      expect(sent()[0]!.text).not.toContain('/admin/collections')
      expect(sent()[0]!.text).not.toContain('Review:')
      expect(warn).toHaveBeenCalled()
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
