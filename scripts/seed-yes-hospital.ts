// Run with `npm run seed:yes-hospital` (`payload run`). Idempotent; safe to re-run.
// Optional env: SEED_REVALIDATE_URL, SEED_WEBHOOK_SECRET (the tenant's site webhook).
import { getPayload } from 'payload'
import { seedYesHospital } from '../seed/yes-hospital/seed'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const { tenant } = await seedYesHospital(payload)
payload.logger.info(`seed:yes-hospital: done (tenant ${tenant})`)
