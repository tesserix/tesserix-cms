import type { Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { User } from '../payload-types'
import { hiddenUnlessTenant } from '../src/access/roles'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import { as, getTestPayload, mkDepartment, mkTenant, mkUser, resetDb } from './helpers'

let payload: Payload
let tA: number
let tB: number
let approverA: User
let editorA: User
let deptA: number

const symptoms = ['Chest pain', 'Breathlessness', 'Palpitations']

beforeEach(async () => {
  await resetDb()
  payload = await getTestPayload()
  tA = await mkTenant('YES Hospital', 'yes-hospital')
  tB = await mkTenant('Other Hospital', 'other')
  approverA = await mkUser('approver-a@test.dev', 'approver', [tA])
  editorA = await mkUser('editor-a@test.dev', 'editor', [tA])
  deptA = await mkDepartment(tA, 'Cardiology')
  // Publishing as a non-approver emails approvers; keep that off the console. Forbidden/validation errors are
  // expected here and logged at INFO, so silence only that level.
  vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
  vi.spyOn(payload.logger, 'info').mockImplementation(() => undefined as never)
})

afterEach(async () => {
  await notificationsSettled()
  vi.restoreAllMocks()
})

describe('departments', () => {
  test('a department with 2 symptoms fails validation; 3 passes', async () => {
    await expect(
      payload.create({
        collection: 'departments',
        data: { name: 'Neuro', description: 'd', symptoms: symptoms.slice(0, 2), tenant: tA, _status: 'published' },
        ...as(approverA),
      }),
    ).rejects.toThrow(/symptoms/i)
    const ok = await payload.create({
      collection: 'departments',
      data: { name: 'Neuro', description: 'd', symptoms, tenant: tA, _status: 'published' },
      ...as(approverA),
    })
    expect(ok.slug).toBe('neuro')
  })
})

describe('slug', () => {
  test('is generated from the name', async () => {
    const doc = await payload.create({
      collection: 'doctors',
      data: { name: 'Dr. Rajesh Baghe', department: deptA, tenant: tA, _status: 'published' },
    })
    expect(doc.slug).toBe('dr-rajesh-baghe')
  })

  test('a duplicate slug in the same tenant fails; the same slug in another tenant succeeds', async () => {
    await payload.create({ collection: 'doctors', data: { name: 'Dr X', slug: 'dr-x', department: deptA, tenant: tA } })
    await expect(
      payload.create({ collection: 'doctors', draft: true, data: { name: 'Dr X2', slug: 'dr-x', tenant: tA }, ...as(editorA) }),
    ).rejects.toThrow(/slug/i)
    await expect(mkDepartment(tA, 'Cardiology')).rejects.toThrow(/slug/i)
    // A pending draft holds its slug too.
    const draft = await payload.create({ collection: 'doctors', draft: true, data: { name: 'Dr Y', tenant: tA }, ...as(editorA) })
    await expect(
      payload.update({ collection: 'doctors', id: draft.id, draft: true, data: { slug: 'dr-x' }, ...as(editorA) }),
    ).rejects.toThrow(/slug/i)

    const deptB = await mkDepartment(tB, 'Cardiology')
    const b = await payload.create({ collection: 'doctors', data: { name: 'Dr X', slug: 'dr-x', department: deptB, tenant: tB } })
    expect(b.slug).toBe('dr-x')
  })

  test('the database also rejects a duplicate (tenant, slug)', async () => {
    await payload.create({ collection: 'doctors', data: { name: 'Dr X', department: deptA, tenant: tA } })
    // payload.db skips hooks, so only the compound unique index can stop this.
    await expect(
      payload.db.create({ collection: 'doctors', data: { name: 'Dr X', slug: 'dr-x', department: deptA, tenant: tA } }),
    ).rejects.toThrow()
  })

  test('an editor changing the slug of a published doctor throws, and an approver succeeds', async () => {
    const doc = await payload.create({
      collection: 'doctors',
      data: { name: 'Dr Live', department: deptA, tenant: tA, _status: 'published' },
    })
    await expect(
      payload.update({ collection: 'doctors', id: doc.id, draft: true, data: { slug: 'renamed' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
    // Still locked after an approver unpublishes it: the URL may already be linked.
    await payload.update({ collection: 'doctors', id: doc.id, data: { _status: 'draft' }, ...as(approverA) })
    await expect(
      payload.update({ collection: 'doctors', id: doc.id, draft: true, data: { slug: 'renamed' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
    // Clearing it does not get round the lock: an empty slug keeps the current one.
    const cleared = await payload.update({ collection: 'doctors', id: doc.id, draft: true, data: { slug: '' }, ...as(editorA) })
    expect(cleared.slug).toBe('dr-live')
    // Other edits by the editor still work.
    await payload.update({ collection: 'doctors', id: doc.id, draft: true, data: { opd: 'Mon-Sat' }, ...as(editorA) })

    const updated = await payload.update({ collection: 'doctors', id: doc.id, data: { slug: 'renamed' }, ...as(approverA) })
    expect(updated.slug).toBe('renamed')
  })

  test('renaming a published doc keeps its old slugs in previousSlugs, public and not writable', async () => {
    const doc = await payload.create({ collection: 'doctors', data: { name: 'Dr Old', department: deptA, tenant: tA, _status: 'published' } })
    expect(doc.previousSlugs ?? []).toEqual([])
    const publish = (data: Record<string, unknown>) =>
      payload.update({ collection: 'doctors', id: doc.id, data: { ...data, _status: 'published' }, ...as(approverA) })
    await publish({ slug: 'dr-mid' })
    // Input is ignored: previousSlugs is derived from the renames only.
    await publish({ slug: 'dr-new', previousSlugs: ['hijack'] })
    await publish({ name: 'Dr New' })
    const anon = await payload.findByID({ collection: 'doctors', id: doc.id, overrideAccess: false, user: null })
    expect(anon.previousSlugs).toEqual(['dr-old', 'dr-mid'])
    // Renaming back to an old slug takes it out of the list: it is current again.
    expect((await publish({ slug: 'dr-old' })).previousSlugs).toEqual(['dr-mid', 'dr-new'])
  })

  test('a never-published doc records no previous slugs', async () => {
    const draft = await payload.create({ collection: 'doctors', draft: true, data: { name: 'Dr Draft', tenant: tA }, ...as(editorA) })
    const doc = await payload.update({ collection: 'doctors', id: draft.id, draft: true, data: { slug: 'dr-draft-2' }, ...as(editorA) })
    expect(doc.previousSlugs ?? []).toEqual([])
  })

  test('a typed slug is normalised like a generated one', async () => {
    const doc = await payload.create({ collection: 'doctors', data: { name: 'Dr N', slug: 'Hello World/../x?y', department: deptA, tenant: tA } })
    expect(doc.slug).toBe('hello-world-x-y')
    const upd = await payload.update({ collection: 'doctors', id: doc.id, data: { slug: '--A_B--' } })
    expect(upd.slug).toBe('a-b')
  })

  test('an editor may change the slug of a never-published draft', async () => {
    const draft = await payload.create({ collection: 'doctors', draft: true, data: { name: 'Dr New', tenant: tA }, ...as(editorA) })
    const doc = await payload.update({ collection: 'doctors', id: draft.id, draft: true, data: { slug: 'dr-new-2' }, ...as(editorA) })
    expect(doc.slug).toBe('dr-new-2')
  })
})

describe('doctors', () => {
  test("a doctor's department must resolve, within the doctor's tenant", async () => {
    const doc = await payload.create({
      collection: 'doctors',
      data: { name: 'Dr A', department: deptA, languages: ['English', 'Hindi'], tenant: tA, _status: 'published' },
    })
    expect(doc.active).toBe(true)
    expect(doc.languages).toEqual(['English', 'Hindi'])
    await expect(
      payload.create({ collection: 'doctors', data: { name: 'Dr B', department: 999999, tenant: tA, _status: 'published' } }),
    ).rejects.toThrow()
    await expect(
      payload.create({ collection: 'doctors', data: { name: 'Dr C', tenant: tA, _status: 'published' } as never }),
    ).rejects.toThrow(/department/i)
    const deptB = await mkDepartment(tB, 'Cardiology')
    await expect(
      payload.create({
        collection: 'doctors',
        data: { name: 'Dr D', department: deptB, tenant: tA, _status: 'published' },
        ...as(approverA),
      }),
    ).rejects.toThrow()
  })
})

describe('doctor department', () => {
  test('publishing requires a published department; drafts do not', async () => {
    const draftDept = (
      await payload.create({
        collection: 'departments',
        draft: true,
        data: { name: 'Draft Dept', description: 'd', symptoms, tenant: tA },
      })
    ).id
    const data = { name: 'Dr P', department: draftDept, tenant: tA }
    await expect(payload.create({ collection: 'doctors', data: { ...data, _status: 'published' } })).rejects.toThrow(/department/i)
    const draft = await payload.create({ collection: 'doctors', draft: true, data })
    await expect(payload.update({ collection: 'doctors', id: draft.id, data: { _status: 'published' } })).rejects.toThrow(/department/i)
    await payload.update({ collection: 'departments', id: draftDept, data: { _status: 'published' } })
    const ok = await payload.update({ collection: 'doctors', id: draft.id, data: { _status: 'published' } })
    expect(ok._status).toBe('published')
  })
})

describe('hospital-info', () => {
  test('one document per tenant', async () => {
    const data = { name: 'YES Hospital', phones: ['+91 1'], values: ['Care'], _status: 'published' as const }
    const info = await payload.create({ collection: 'hospital-info', data: { ...data, tenant: tA } })
    expect(info.phones).toEqual(['+91 1'])
    await expect(payload.create({ collection: 'hospital-info', data: { ...data, tenant: tA } })).rejects.toThrow()
    await payload.create({ collection: 'hospital-info', data: { ...data, tenant: tB } })
  })

  test('is under the approval workflow', async () => {
    await expect(
      payload.create({ collection: 'hospital-info', data: { name: 'x', tenant: tA, _status: 'published' }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
  })
})

describe('simple collections', () => {
  test('accept the site data shapes', async () => {
    const pub = { tenant: tA, _status: 'published' as const }
    await payload.create({ collection: 'testimonials', data: { name: 'T', videoId: 'h7V1eiVcFqg', language: 'Hindi', ...pub } })
    await payload.create({ collection: 'videos', data: { youtubeId: 'abc', title: 'Tour', ...pub } })
    await payload.create({ collection: 'faqs', data: { question: 'Q?', answer: 'A.', ...pub } })
    await payload.create({ collection: 'insurers', data: { name: 'Star Health', ...pub } })
    await payload.create({ collection: 'tpas', data: { name: 'MD India', ...pub } })
    await payload.create({ collection: 'schemes', data: { name: 'MJPJAY', description: 'State scheme', ...pub } })
    await expect(
      payload.create({ collection: 'faqs', data: { question: 'Q?', answer: 'A.', ...pub }, ...as(editorA) }),
    ).rejects.toThrow(/not allowed/i)
  })
})

describe('admin visibility', () => {
  test('YES Hospital collections are shown only to users of that tenant, and to super-admins', async () => {
    const hidden = hiddenUnlessTenant('yes-hospital')
    const editorB = await mkUser('editor-b@test.dev', 'editor', [tB])
    const root = await mkUser('root@test.dev', 'super-admin')
    const both = await mkUser('both@test.dev', 'approver', [tB, tA])
    const view = (u: User) => hidden({ user: u as never })
    expect(view(editorA)).toBe(false)
    expect(view(both)).toBe(false)
    expect(view(root)).toBe(false)
    expect(view(editorB)).toBe(true)
    // The hidden check reads the user as the admin gets it: depth 0, from the JWT strategy.
    const me = await payload.findByID({ collection: 'users', id: editorA.id, depth: 0 })
    expect(view(me)).toBe(false)
  })
})
