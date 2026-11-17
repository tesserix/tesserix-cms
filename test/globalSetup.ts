import { execFileSync } from 'node:child_process'
import { loadEnv } from 'vite'

/**
 * Rebuilds the test DB from src/migrations once per run with the same CLI production uses, so
 * tests exercise the real migrations. A child process, because an in-process Payload keeps
 * handles open that stop vitest from exiting.
 */
export default function setup() {
  const env: NodeJS.ProcessEnv = { ...process.env, ...loadEnv('test', process.cwd(), ''), NODE_ENV: 'test' }
  const name = new URL(env.DATABASE_URL_TEST || 'missing:').pathname.slice(1)
  if (!name.endsWith('_test')) throw new Error(`DATABASE_URL_TEST must name a *_test database, got "${name}"`)
  execFileSync('npx', ['payload', 'migrate:fresh', '--force-accept-warning'], { env, stdio: 'inherit' })
}
