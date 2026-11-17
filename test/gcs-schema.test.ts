import { afterAll, expect, test, vi } from 'vitest'

// The config reads GCS_BUCKET when it is imported, so set it before importing anything that loads it.
vi.stubEnv('GCS_BUCKET', 'test-bucket')
const { getTestPayload } = await import('./helpers')

afterAll(() => {
  vi.unstubAllEnvs()
})

// Production runs with GCS on; the migrations must match that schema too. find() needs no network.
test('with GCS_BUCKET set, payload boots on the migrated schema and media queries work', async () => {
  const payload = await getTestPayload()
  expect(payload.collections.media.config.upload.disableLocalStorage).toBe(true) // GCS really is on
  const res = await payload.find({ collection: 'media', overrideAccess: true })
  expect(res.docs).toBeInstanceOf(Array)
})
