import { sql } from '@payloadcms/db-postgres/drizzle'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'

// Fail loudly rather than falling back to the dev database.
if (!process.env.DATABASE_URL_TEST) throw new Error('DATABASE_URL_TEST is not set')

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
