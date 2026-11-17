import type { CollectionSlug, Payload } from 'payload'
import { afterEach, beforeAll, expect, test, vi } from 'vitest'
import * as data from '../seed/yes-hospital/data'
import { seedYesHospital } from '../seed/yes-hospital/seed'
import { notificationsSettled } from '../src/hooks/notifyApprovers'
import { as, getTestPayload, mkUser, resetDb } from './helpers'

let payload: Payload

const count = async (collection: CollectionSlug) => (await payload.count({ collection, overrideAccess: true })).totalDocs
const dept = async () => (await payload.find({ collection: 'departments', where: { slug: { equals: data.departments[0]!.id } }, overrideAccess: true })).docs[0]!

beforeAll(async () => {
  await resetDb()
  payload = await getTestPayload()
})

afterEach(async () => {
  await notificationsSettled()
  vi.unstubAllEnvs()
})

test('a run that failed part-way is completed by the next run, without overwriting edits', async () => {
  vi.stubEnv('SEED_FORCE', '')
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))
  vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
  const failAtDoctors = (step: string) => {
    if (step === 'doctors') throw new Error('boom')
  }
  await expect(seedYesHospital(payload, { onStep: failAtDoctors })).rejects.toThrow('boom')
  expect([await count('tenants'), await count('departments'), await count('doctors')]).toEqual([1, data.departments.length, 0])

  // An approver edits a seeded department before the re-run.
  const tenant = (await dept()).tenant as number
  const approver = await mkUser('approver@yes.test', 'approver', [tenant])
  await payload.update({ collection: 'departments', id: (await dept()).id, data: { blurb: 'Edited', _status: 'published' }, ...as(approver) })

  const resumed = await seedYesHospital(payload)
  expect(resumed.skipped).toBe(false)
  expect(await count('doctors')).toBe(36)
  expect(await count('departments')).toBe(data.departments.length)
  expect(await count('schemes')).toBe(data.schemes.length)
  expect(await count('media')).toBe(13)
  expect((await dept()).blurb).toBe('Edited')

  // Finished now: a further run changes nothing and says how to force.
  const info = vi.spyOn(payload.logger, 'info')
  await payload.update({ collection: 'departments', id: (await dept()).id, data: { blurb: 'Edited again', _status: 'published' }, ...as(approver) })
  expect((await seedYesHospital(payload)).skipped).toBe(true)
  expect((await dept()).blurb).toBe('Edited again')
  expect(String(info.mock.calls.at(-1)?.[0])).toContain('if a previous run failed part-way it will resume; SEED_FORCE=true overwrites CMS edits')
}, 300_000)
