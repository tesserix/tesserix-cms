// Run with `npm run seed:tesserix` (`payload run`). First run only: once a run has finished it
// changes nothing and exits 0; a run that failed part-way is resumed. SEED_FORCE=true overwrites
// existing content with the seed, published. Optional env: SEED_REVALIDATE_URL, SEED_WEBHOOK_SECRET.
import { getPayload } from 'payload'
import { seedTesserix } from '../seed/tesserix/seed'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const { tenant, skipped } = await seedTesserix(payload)
if (!skipped) payload.logger.info(`seed:tesserix: done (tenant ${tenant})`)
