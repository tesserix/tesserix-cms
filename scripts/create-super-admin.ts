// Run with `npm run create-super-admin` (`payload run`), before the service is exposed.
// Env: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD (12+ chars). Idempotent: an existing email is left as is.
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { createSuperAdmin } from './lib/createSuperAdmin'

const payload = await getPayload({ config })
await createSuperAdmin(payload, { email: process.env.SUPER_ADMIN_EMAIL, password: process.env.SUPER_ADMIN_PASSWORD })
