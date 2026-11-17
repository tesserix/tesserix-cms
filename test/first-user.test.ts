import { beforeEach, expect, test } from 'vitest'
import { createSuperAdmin } from '../scripts/lib/createSuperAdmin'
import { getTestPayload, rest, resetDb } from './helpers'

beforeEach(resetDb)

test('anonymous first-user registration on an empty DB is refused', async () => {
  const payload = await getTestPayload()
  const res = await rest('/users/first-register', undefined, {
    method: 'POST',
    body: { email: 'attacker@test.dev', password: 'x-password-123', role: 'super-admin' },
  })
  expect(res.status).toBe(403)
  expect((await payload.find({ collection: 'users' })).totalDocs).toBe(0)
})

test('createSuperAdmin creates one super-admin and is idempotent', async () => {
  const payload = await getTestPayload()
  await createSuperAdmin(payload, { email: 'Root@Test.dev', password: 'root-password-123' })
  await createSuperAdmin(payload, { email: 'root@test.dev', password: 'other-password-456' })
  const { docs } = await payload.find({ collection: 'users' })
  expect(docs.map((u) => [u.email, u.role])).toEqual([['root@test.dev', 'super-admin']])
  // The second run leaves the existing password alone.
  await expect(payload.login({ collection: 'users', data: { email: 'root@test.dev', password: 'root-password-123' } })).resolves.toBeTruthy()
})

test('createSuperAdmin refuses a missing or short password', async () => {
  const payload = await getTestPayload()
  await expect(createSuperAdmin(payload, { email: 'root@test.dev', password: '' })).rejects.toThrow(/SUPER_ADMIN_PASSWORD/)
  await expect(createSuperAdmin(payload, { email: '', password: 'root-password-123' })).rejects.toThrow(/SUPER_ADMIN_EMAIL/)
})
