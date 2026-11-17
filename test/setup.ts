import { beforeEach, vi } from 'vitest'

// Publishing fires the site revalidation webhook; no test should reach the network.
beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))
})
