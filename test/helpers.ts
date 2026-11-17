import { sql } from '@payloadcms/db-postgres/drizzle'
import { getPayload, handleEndpoints, type Payload } from 'payload'
import type { User } from '../payload-types'
import config from '../src/payload.config'

// Fail loudly before connecting (Payload pushes schema on connect) rather than touching a non-test database.
const testDbName = new URL(process.env.DATABASE_URL_TEST || 'missing:').pathname.slice(1)
if (!testDbName.endsWith('_test')) throw new Error(`DATABASE_URL_TEST must name a *_test database, got "${testDbName}"`)

let cached: Promise<Payload> | undefined

export const getTestPayload = (): Promise<Payload> => (cached ??= getPayload({ config }))

/** Truncate every table except Payload's migration bookkeeping. */
export async function resetDb(): Promise<void> {
  const payload = await getTestPayload()
  const { drizzle } = payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: Record<string, string>[] }> } }
  const name = (await drizzle.execute(sql`SELECT current_database() AS name`)).rows[0]?.name ?? ''
  if (!name.endsWith('_test')) throw new Error(`resetDb refuses to truncate "${name}": not a *_test database`)
  const { rows } = await drizzle.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'payload_migrations%'`,
  )
  if (!rows.length) return
  const list = rows.map((r) => `"${r.tablename}"`).join(', ')
  await drizzle.execute(sql.raw(`TRUNCATE ${list} RESTART IDENTITY CASCADE`))
}

// Shared fixtures for tests that act as real users.

export const password = 'test-password-123'

/** Local API options for a call made as a real user, with access control enforced. */
export const as = (user: User | null) => ({ overrideAccess: false, user })

export const mkUser = async (email: string, role: User['role'], tenants: number[] = []) =>
  (await getTestPayload()).create({
    collection: 'users',
    data: { email, password, role, tenants: tenants.map((tenant) => ({ tenant })) },
  })

export const mkTenant = async (name: string, slug: string) =>
  (
    await (await getTestPayload()).create({
      collection: 'tenants',
      data: { name, slug, siteUrl: `https://${slug}.test`, revalidateUrl: `https://${slug}.test/api/revalidate`, webhookSecret: `secret-${slug}` },
    })
  ).id

/** Payload's REST handler (what the Next API route calls), so no running server is needed. */
export const rest = async (path: string, user?: User, init: { method?: string; body?: unknown } = {}) => {
  const headers: Record<string, string> = {}
  if (user) {
    const { token } = await (await getTestPayload()).login({ collection: 'users', data: { email: user.email, password } })
    headers.Authorization = `JWT ${token}`
  }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'
  const body = init.body === undefined ? undefined : JSON.stringify(init.body)
  return handleEndpoints({ config, request: new Request(`http://localhost/api${path}`, { method: init.method, headers, body }) })
}

/** A published department (doctors require one). */
export const mkDepartment = async (tenant: number, name: string) =>
  (
    await (await getTestPayload()).create({
      collection: 'departments',
      data: { name, description: `${name} care`, symptoms: ['a', 'b', 'c'], tenant, _status: 'published' },
    })
  ).id
