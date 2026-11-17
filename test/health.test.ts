import { beforeEach, expect, test } from 'vitest'
import { getTestPayload, resetDb } from './helpers'

beforeEach(resetDb)

test('payload boots and the users collection is empty', async () => {
  const payload = await getTestPayload()
  const res = await payload.find({ collection: 'users' })
  expect(res.totalDocs).toBe(0)
})
