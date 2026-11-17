import { sql } from '@payloadcms/db-postgres/drizzle'
import { getPayload, type Payload } from 'payload'
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
