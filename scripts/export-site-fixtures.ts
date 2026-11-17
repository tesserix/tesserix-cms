// Writes the CMS's real anonymous responses to the YES Hospital site's queries as JSON fixtures,
// so the site's tests run against what the CMS actually returns. Against a freshly seeded test DB,
// with media/ moved aside first (else Payload suffixes the photo filenames that are already on disk):
//   NODE_ENV=test npx payload migrate:fresh --force-accept-warning
//   NODE_ENV=test npm run seed:yes-hospital
//   NODE_ENV=test GCS_BUCKET=tesserix-cms-media-prod-in npx payload run scripts/export-site-fixtures.ts <out dir>
// GCS_BUCKET only shapes the photo URLs as production serves them (find needs no network).
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { handleEndpoints } from 'payload'
import config from '../src/payload.config'
import { SITE_COLLECTIONS, siteQuery } from './lib/siteQueries'

const out = process.argv[2]
if (!out) throw new Error('usage: payload run scripts/export-site-fixtures.ts <out dir>')
await mkdir(out, { recursive: true })
for (const collection of SITE_COLLECTIONS) {
  const res = await handleEndpoints({ config, request: new Request(`http://localhost/api${siteQuery(collection)}`) })
  const body = await res.json()
  if (res.status !== 200) throw new Error(`${collection}: HTTP ${res.status} ${JSON.stringify(body)}`)
  await writeFile(path.join(out, `${collection}.json`), `${JSON.stringify(body, null, 2)}\n`)
  console.log(`${collection}: ${body.docs.length} docs`)
}
process.exit(0)
