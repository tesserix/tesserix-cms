import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionSlug, Payload, Where } from 'payload'
import * as data from './data'

// The shape of one entry in data.products (a union of six literals, so spelled out once here).
type ProductSeed = {
  listings?: Partial<Record<'ios' | 'android', { url: string }>>
  vendorListing?: { url: string }
  media?: { site?: { src: string; alt: string }; screenshots?: { src: string; alt: string }[] }
  pricingUrl?: string
  [field: string]: unknown
}

const mediaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'media')

/**
 * Loads the tesserix.app marketing site's current content into the CMS, all published. Same
 * contract as seedYesHospital: a first-time bootstrap that resumes a part-finished run (creating
 * only what is missing) and otherwise changes nothing, because a re-run would overwrite published
 * edits. SEED_FORCE=true overwrites anyway (matched by slug, or by title/name; media by alt text).
 * Runs as a trusted server call and never emails approvers or pings the site.
 */
export async function seedTesserix(payload: Payload): Promise<{ tenant: number; skipped: boolean }> {
  const opts = { overrideAccess: true, depth: 0, context: { skipNotifications: true } } as const
  const force = process.env.SEED_FORCE === 'true'

  const findOne = async (collection: CollectionSlug, where: Where) =>
    (await payload.find({ collection, where, limit: 1, pagination: false, draft: true, ...opts })).docs[0] as { id: number } | undefined
  const count = async (collection: CollectionSlug, tenant: number) =>
    (await payload.count({ collection, where: { tenant: { equals: tenant } }, overrideAccess: true })).totalDocs

  const env = { revalidateUrl: process.env.SEED_REVALIDATE_URL || undefined, webhookSecret: process.env.SEED_WEBHOOK_SECRET || undefined }
  const tenantData = { name: 'Tesserix', slug: 'tesserix', siteUrl: 'https://tesserix.app', ...env }
  const existing = await findOne('tenants', { slug: { equals: 'tesserix' } })
  // Open-source projects are the seed's last write, so their full count means a previous run finished.
  const finished = existing && (await count('open-source-projects', existing.id)) >= data.openSource.length
  if (finished && !force) {
    payload.logger.info('seed:tesserix: tenant tesserix is already seeded; nothing changed. (a part-finished run resumes; SEED_FORCE=true overwrites CMS edits)')
    return { tenant: existing.id, skipped: true }
  }
  if (existing && !force) payload.logger.info('seed:tesserix: a previous run did not finish; creating only what is missing')
  const tenant = !existing
    ? (await payload.create({ collection: 'tenants', data: tenantData, ...opts })).id
    : force
      ? (await payload.update({ collection: 'tenants', id: existing.id, data: tenantData, ...opts })).id
      : existing.id

  // Without SEED_FORCE an existing doc is left as it is: it may already carry CMS edits.
  const upsert = async (collection: CollectionSlug, key: Where, fields: Record<string, unknown>) => {
    const doc = await findOne(collection, { and: [{ tenant: { equals: tenant } }, key] })
    if (doc && !force) return doc
    const body = { ...fields, tenant, _status: 'published' } as never
    return doc ? payload.update({ collection, id: doc.id, data: body, ...opts }) : payload.create({ collection, data: body, ...opts })
  }
  // Media is matched by alt text: Payload may suffix a filename that is taken.
  const media = async (src: string, alt: string): Promise<number> =>
    (await findOne('media', { and: [{ tenant: { equals: tenant } }, { alt: { equals: alt } }] }))?.id ??
    ((await payload.create({ collection: 'media', data: { alt, tenant }, filePath: path.join(mediaDir, path.basename(src)), ...opts })).id as number)

  let order = 0
  for (const [slug, p] of Object.entries(data.products)) {
    const { listings, vendorListing, media: m, pricingUrl, ...rest } = p as ProductSeed
    const siteImage = m?.site ? await media(m.site.src, m.site.alt) : undefined
    const screenshots: number[] = []
    for (const s of m?.screenshots ?? []) screenshots.push(await media(s.src, s.alt))
    await upsert('products', { slug: { equals: slug } }, {
      ...rest,
      slug,
      order: order++,
      pricingUrl,
      listings: Object.entries(listings ?? {}).map(([platform, l]) => ({ platform, url: l.url })),
      vendorListingUrl: vendorListing?.url,
      siteImage,
      screenshots,
    })
  }

  order = 0
  for (const { photo, ...m } of data.team) {
    await upsert('team-members', { slug: { equals: m.slug } }, { ...m, order: order++, photo: await media(photo, m.name) })
  }
  order = 0
  for (const p of data.principles) await upsert('principles', { title: { equals: p.title } }, { ...p, order: order++ })
  order = 0
  for (const b of data.beliefs) await upsert('beliefs', { title: { equals: b.title } }, { ...b, order: order++ })
  order = 0
  for (const r of data.openSource) await upsert('open-source-projects', { name: { equals: r.name } }, { ...r, order: order++ })

  return { tenant: tenant as number, skipped: false }
}
