import { handleEndpoints, type Payload } from 'payload'
import { beforeEach, describe, expect, test } from 'vitest'
import config from '../src/payload.config'
import { getApproverEmails } from '../src/access/roles'
import type { User } from '../payload-types'
import { getTestPayload, resetDb } from './helpers'

type Role = User['role']
type U = User

let payload: Payload
let tA: number
let tB: number
let superAdmin: U
let approverA: U
let editorA: U
let editorB: U
let docA: number
let docB: number
let mediaB: number

const password = 'test-password-123'
// A 1x1 transparent PNG.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)
const file = (name: string) => ({ data: png, mimetype: 'image/png', name, size: png.length })

const mkUser = async (email: string, role: Role, tenants: number[] = []) =>
  payload.create({
    collection: 'users',
    data: { email, password, role, tenants: tenants.map((tenant) => ({ tenant })) },
  })

// Local API calls made as a real user, with access control enforced.
const as = (user: U | null) => ({ overrideAccess: false, user })

beforeEach(async () => {
  await resetDb()
  payload = await getTestPayload()
  const mkTenant = async (name: string, slug: string) =>
    (
      await payload.create({
        collection: 'tenants',
        data: { name, slug, siteUrl: `https://${slug}.test`, revalidateUrl: `https://${slug}.test/api/revalidate`, webhookSecret: `secret-${slug}` },
      })
    ).id
  tA = await mkTenant('Hospital A', 'a')
  tB = await mkTenant('Hospital B', 'b')
  superAdmin = await mkUser('root@test.dev', 'super-admin')
  approverA = await mkUser('approver-a@test.dev', 'approver', [tA])
  editorA = await mkUser('editor-a@test.dev', 'editor', [tA])
  editorB = await mkUser('editor-b@test.dev', 'editor', [tB])
  docA = (await payload.create({ collection: 'doctors', data: { name: 'Dr A', tenant: tA } })).id
  docB = (await payload.create({ collection: 'doctors', data: { name: 'Dr B', tenant: tB } })).id
  await payload.create({ collection: 'media', data: { alt: 'A', tenant: tA }, file: file('a.png') })
  mediaB = (await payload.create({ collection: 'media', data: { alt: 'B', tenant: tB }, file: file('b.png') })).id
})

describe('content isolation', () => {
  test('an editor of A finding doctors never sees B docs', async () => {
    const res = await payload.find({ collection: 'doctors', ...as(editorA) })
    expect(res.docs.map((d) => d.id)).toEqual([docA])
  })

  test('an editor of A cannot findByID a B doc', async () => {
    await expect(payload.findByID({ collection: 'doctors', id: docB, ...as(editorA) })).rejects.toThrow()
  })

  test('an editor of A cannot update, delete, or create B docs', async () => {
    await expect(
      payload.update({ collection: 'doctors', id: docB, data: { name: 'hacked' }, ...as(editorA) }),
    ).rejects.toThrow()
    await expect(payload.delete({ collection: 'doctors', id: docB, ...as(editorA) })).rejects.toThrow()
    await expect(
      payload.create({ collection: 'doctors', data: { name: 'planted', tenant: tB }, ...as(editorA) }),
    ).rejects.toThrow()
    // Moving an A doc into B is also a cross-tenant write.
    await expect(
      payload.update({ collection: 'doctors', id: docA, data: { tenant: tB }, ...as(editorA) }),
    ).rejects.toThrow()
    const b = await payload.findByID({ collection: 'doctors', id: docB })
    expect(b.name).toBe('Dr B')
    expect(await payload.count({ collection: 'doctors' })).toEqual({ totalDocs: 2 })
  })

  test('an editor of A never sees B media', async () => {
    const res = await payload.find({ collection: 'media', ...as(editorA) })
    expect(res.docs.map((d) => d.alt)).toEqual(['A'])
    await expect(payload.findByID({ collection: 'media', id: mediaB, ...as(editorA) })).rejects.toThrow()
  })

  test('anonymous cannot read doctors', async () => {
    await expect(payload.find({ collection: 'doctors', ...as(null) })).rejects.toThrow()
  })

  test('a super-admin sees every tenant', async () => {
    const res = await payload.find({ collection: 'doctors', ...as(superAdmin) })
    expect(res.totalDocs).toBe(2)
  })

  test('REST: an editor of A listing doctors never sees B docs', async () => {
    const { token } = await payload.login({ collection: 'users', data: { email: editorA.email, password } })
    const rest = (path: string, auth = true) =>
      handleEndpoints({
        config,
        request: new Request(`http://localhost/api${path}`, {
          headers: auth ? { Authorization: `JWT ${token}` } : {},
        }),
      })
    const list = await rest('/doctors')
    expect(list.status).toBe(200)
    const body = (await list.json()) as { docs: { id: number }[] }
    expect(body.docs.map((d) => d.id)).toEqual([docA])
    expect((await rest(`/doctors/${docB}`)).status).toBe(404)
    expect((await rest('/doctors', false)).status).toBe(403)
  })
})

describe('tenants', () => {
  test('webhookSecret is absent from a non-super-admin findByID', async () => {
    const t = await payload.findByID({ collection: 'tenants', id: tA, ...as(approverA) })
    expect(t.name).toBe('Hospital A')
    expect(t).not.toHaveProperty('webhookSecret')
    const asEditor = await payload.findByID({ collection: 'tenants', id: tA, ...as(editorA) })
    expect(asEditor).not.toHaveProperty('webhookSecret')
    const asRoot = await payload.findByID({ collection: 'tenants', id: tA, ...as(superAdmin) })
    expect(asRoot.webhookSecret).toBe('secret-a')
  })

  test('a user of A cannot read tenant B', async () => {
    await expect(payload.findByID({ collection: 'tenants', id: tB, ...as(editorA) })).rejects.toThrow()
  })

  test('only a super-admin can write tenants', async () => {
    await expect(
      payload.update({ collection: 'tenants', id: tA, data: { name: 'x' }, ...as(approverA) }),
    ).rejects.toThrow()
    await expect(
      payload.create({ collection: 'tenants', data: { name: 'C', slug: 'c' }, ...as(approverA) }),
    ).rejects.toThrow()
  })

  test('getApproverEmails lists the approvers of a tenant', async () => {
    await mkUser('approver-b@test.dev', 'approver', [tB])
    expect(await getApproverEmails(payload, tA)).toEqual(['approver-a@test.dev'])
  })
})

describe('users and privilege escalation', () => {
  const newUser = (tenants: number[], role: Role = 'editor') => ({
    email: `new-${Math.random().toString(36).slice(2)}@test.dev`,
    password,
    role,
    tenants: tenants.map((tenant) => ({ tenant })),
  })

  test('anonymous create on users throws Forbidden', async () => {
    await expect(payload.create({ collection: 'users', data: newUser([tA]), ...as(null) })).rejects.toThrow(
      /not allowed/i,
    )
  })

  test('an approver of A can create an editor in A', async () => {
    const u = await payload.create({ collection: 'users', data: newUser([tA]), ...as(approverA) })
    expect(u.role).toBe('editor')
  })

  test('an approver of A cannot create a user in B', async () => {
    await expect(payload.create({ collection: 'users', data: newUser([tB]), ...as(approverA) })).rejects.toThrow()
    await expect(payload.create({ collection: 'users', data: newUser([tA, tB]), ...as(approverA) })).rejects.toThrow()
  })

  test('an approver cannot create a super-admin', async () => {
    await expect(
      payload.create({ collection: 'users', data: newUser([tA], 'super-admin'), ...as(approverA) }),
    ).rejects.toThrow()
  })

  test('an approver cannot promote someone to super-admin', async () => {
    await expect(
      payload.update({ collection: 'users', id: editorA.id, data: { role: 'super-admin' }, ...as(approverA) }),
    ).rejects.toThrow()
    expect((await payload.findByID({ collection: 'users', id: editorA.id })).role).toBe('editor')
  })

  test('an approver cannot add a tenant they do not belong to', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: editorA.id,
        data: { tenants: [{ tenant: tA }, { tenant: tB }] },
        ...as(approverA),
      }),
    ).rejects.toThrow()
    const u = await payload.findByID({ collection: 'users', id: editorA.id, depth: 0 })
    expect(u.tenants?.map((t) => t.tenant)).toEqual([tA])
  })

  test('an approver cannot touch users outside their tenants or a super-admin', async () => {
    await expect(
      payload.update({ collection: 'users', id: editorB.id, data: { name: 'x' }, ...as(approverA) }),
    ).rejects.toThrow()
    await expect(payload.delete({ collection: 'users', id: editorB.id, ...as(approverA) })).rejects.toThrow()
    const rootInA = await mkUser('root-a@test.dev', 'super-admin', [tA])
    await expect(
      payload.update({ collection: 'users', id: rootInA.id, data: { name: 'x' }, ...as(approverA) }),
    ).rejects.toThrow()
    await expect(payload.delete({ collection: 'users', id: rootInA.id, ...as(approverA) })).rejects.toThrow()
  })

  test('an approver can delete a user in their tenant', async () => {
    await payload.delete({ collection: 'users', id: editorA.id, ...as(approverA) })
    expect((await payload.count({ collection: 'users', where: { id: { equals: editorA.id } } })).totalDocs).toBe(0)
  })

  test('an editor cannot change their own role or tenants', async () => {
    await payload
      .update({ collection: 'users', id: editorA.id, data: { role: 'super-admin' }, ...as(editorA) })
      .catch(() => undefined)
    await payload
      .update({ collection: 'users', id: editorA.id, data: { tenants: [{ tenant: tA }, { tenant: tB }] }, ...as(editorA) })
      .catch(() => undefined)
    const u = await payload.findByID({ collection: 'users', id: editorA.id, depth: 0 })
    expect(u.role).toBe('editor')
    expect(u.tenants?.map((t) => t.tenant)).toEqual([tA])
  })

  test('an editor can update their own name and password, but no one else', async () => {
    const u = await payload.update({
      collection: 'users',
      id: editorA.id,
      data: { name: 'Edie', password: 'new-password-456' },
      ...as(editorA),
    })
    expect(u.name).toBe('Edie')
    await payload.login({ collection: 'users', data: { email: 'editor-a@test.dev', password: 'new-password-456' } })
    await expect(
      payload.update({ collection: 'users', id: approverA.id, data: { name: 'x' }, ...as(editorA) }),
    ).rejects.toThrow()
    await expect(payload.create({ collection: 'users', data: newUser([tA]), ...as(editorA) })).rejects.toThrow()
    await expect(payload.delete({ collection: 'users', id: editorA.id, ...as(editorA) })).rejects.toThrow()
  })

  test('approvers and editors must belong to at least one tenant; a super-admin need not', async () => {
    await expect(payload.create({ collection: 'users', data: newUser([], 'editor') })).rejects.toThrow()
    await expect(payload.create({ collection: 'users', data: newUser([], 'approver') })).rejects.toThrow()
    await expect(
      payload.update({ collection: 'users', id: editorA.id, data: { tenants: [] }, ...as(superAdmin) }),
    ).rejects.toThrow()
    expect(superAdmin.role).toBe('super-admin')
  })

  test('login is locked after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await payload.login({ collection: 'users', data: { email: 'editor-a@test.dev', password: 'wrong' } }).catch(() => undefined)
    }
    await expect(
      payload.login({ collection: 'users', data: { email: 'editor-a@test.dev', password } }),
    ).rejects.toThrow(/locked/i)
  })
})
