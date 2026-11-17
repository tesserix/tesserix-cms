// Run with `npm run seed:yes-hospital` (`payload run`). First run only: once a run has finished it
// changes nothing and exits 0; a run that failed part-way is resumed (missing docs only). SEED_FORCE=true overwrites existing content with the seed, published.
// Optional env: SEED_REVALIDATE_URL, SEED_WEBHOOK_SECRET (the tenant's site webhook).
import { getPayload } from 'payload'
import { seedYesHospital } from '../seed/yes-hospital/seed'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const { tenant, skipped } = await seedYesHospital(payload)
if (!skipped) payload.logger.info(`seed:yes-hospital: done (tenant ${tenant})`)
