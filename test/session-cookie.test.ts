import { afterAll, expect, test, vi } from 'vitest'

afterAll(() => {
  vi.unstubAllEnvs()
})

// The cookie options are read when Users is imported, so import it under each NODE_ENV.
test('the session cookie is Secure and SameSite=Lax in production, plain http elsewhere', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.resetModules()
  const prod = (await import('../src/collections/Users')).Users.auth
  expect(typeof prod === 'object' && prod.cookies).toEqual({ secure: true, sameSite: 'Lax' })

  vi.stubEnv('NODE_ENV', 'test')
  vi.resetModules()
  const dev = (await import('../src/collections/Users')).Users.auth
  expect(typeof dev === 'object' && dev.cookies).toEqual({ secure: false, sameSite: 'Lax' })
})
