import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    env: { ...loadEnv('test', process.cwd(), ''), NODE_ENV: 'test' },
    include: ['test/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false, // one shared test DB
  },
})
