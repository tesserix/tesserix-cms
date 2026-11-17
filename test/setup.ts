import { beforeEach, vi } from 'vitest'

// Publishing fires the site revalidation webhook; no test should reach the network. Tests that
// expect a call mock fetch themselves; anything else fails (and is logged by the caller).
beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('unexpected network call in test'))
})
