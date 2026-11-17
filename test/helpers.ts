import { sql } from '@payloadcms/db-postgres/drizzle'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'

let cached: Promise<Payload> | undefined

export const getTestPayload = (): Promise<Payload> => (cached ??= getPayload({ config }))

/** Truncate every table except Payload's migration bookkeeping. */
export async function resetDb(): Promise<void> {
  const payload = await getTestPayload()
  const { drizzle } = payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: { tablename: string }[] }> } }
  const { rows } = await drizzle.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'payload_migrations%'`,
  )
  if (!rows.length) return
  const list = rows.map((r) => `"${r.tablename}"`).join(', ')
  await drizzle.execute(sql.raw(`TRUNCATE ${list} RESTART IDENTITY CASCADE`))
}
