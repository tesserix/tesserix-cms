import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionSlug, Payload, Where } from 'payload'
import * as data from './data'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'photos')

/**
 * Loads YES Hospital's current site content into the CMS, all published. It is a first-time
 * bootstrap: once a run has finished (the tenant, its hospital-info and the last collection the
 * seed writes are all there) it logs and returns without touching anything, because a re-run would
 * overwrite published edits and publish over pending drafts. A run that failed part-way resumes:
 * it creates only what is missing and never updates an existing doc.
 * With SEED_FORCE=true it re-runs anyway: the tenant, departments and doctors are matched by slug,
 * media by alt text (Payload may suffix a filename that is taken), the rest by natural key, and
 * every match is overwritten with the seed's content, published. Nothing is duplicated.
 * Runs as a trusted server call (`overrideAccess`) and never emails approvers or pings the site.
 * `onStep` is for tests: it is called before each step, so a test can fail a run part-way.
 */
export async function seedYesHospital(
  payload: Payload,
  { onStep }: { onStep?: (step: string) => void } = {},
): Promise<{ tenant: number; skipped: boolean }> {
  const opts = { overrideAccess: true, depth: 0, context: { skipNotifications: true } } as const
  const force = process.env.SEED_FORCE === 'true'

  const findOne = async (collection: CollectionSlug, where: Where) =>
    (await payload.find({ collection, where, limit: 1, pagination: false, draft: true, ...opts })).docs[0] as { id: number } | undefined
  const count = async (collection: CollectionSlug, tenant: number) =>
    (await payload.count({ collection, where: { tenant: { equals: tenant } }, overrideAccess: true })).totalDocs

  // Tenant. Webhook settings come from env on first run and are only overwritten when set.
  const env = { revalidateUrl: process.env.SEED_REVALIDATE_URL || undefined, webhookSecret: process.env.SEED_WEBHOOK_SECRET || undefined }
  const tenantData = { name: 'YES Hospital & Research Centre', slug: 'yes-hospital', siteUrl: 'https://yeshospital.in', ...env }
  const existing = await findOne('tenants', { slug: { equals: 'yes-hospital' } })
  // Schemes are the seed's last write, so their full count means a previous run finished.
  // shortcut: deleting a seeded scheme in the CMS makes the next run re-create the missing ones; check a marker if that matters.
  const finished = existing && (await count('hospital-info', existing.id)) > 0 && (await count('schemes', existing.id)) >= data.schemes.length
  if (finished && !force) {
    payload.logger.info(
      'seed:yes-hospital: tenant yes-hospital is already seeded; nothing changed. (if a previous run failed part-way it will resume; SEED_FORCE=true overwrites CMS edits)',
    )
    return { tenant: existing.id, skipped: true }
  }
  if (existing && !force) payload.logger.info('seed:yes-hospital: a previous run did not finish; creating only what is missing')
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
    return doc
      ? payload.update({ collection, id: doc.id, data: body, ...opts })
      : payload.create({ collection, data: body, ...opts })
  }

  await upsert('hospital-info', {}, data.hospitalInfo)

  // Departments first: a doctor can only be published into a published department.
  const deptIdByName = new Map<string, number>()
  for (const { id, doctors: _derived, ...d } of data.departments) {
    const order = data.featuredDepartmentIds.indexOf(id)
    const doc = await upsert('departments', { slug: { equals: id } }, { ...d, slug: id, featured: order >= 0, featuredOrder: order >= 0 ? order : null })
    deptIdByName.set(d.name, doc.id as number)
  }

  onStep?.('doctors')
  for (const { id, specialty, photo, ...d } of data.doctors) {
    const department = deptIdByName.get(specialty)
    if (!department) throw new Error(`seed: doctor ${id} has unknown specialty "${specialty}"`)
    let photoId: number | undefined
    if (photo) {
      const alt = d.name
      photoId =
        (await findOne('media', { and: [{ tenant: { equals: tenant } }, { alt: { equals: alt } }] }))?.id ??
        ((await payload.create({ collection: 'media', data: { alt, tenant }, filePath: path.join(photosDir, path.basename(photo)), ...opts })).id as number)
    }
    await upsert('doctors', { slug: { equals: id } }, { ...d, slug: id, department, photo: photoId, active: true })
  }

  onStep?.('rest')
  for (const t of data.testimonials) await upsert('testimonials', { videoId: { equals: t.videoId } }, t)
  for (const v of data.videos) await upsert('videos', { youtubeId: { equals: v.id } }, { youtubeId: v.id, title: v.title })
  for (const f of data.faqs) await upsert('faqs', { question: { equals: f.question } }, f)
  for (const name of data.insurers) await upsert('insurers', { name: { equals: name } }, { name })
  for (const name of data.tpas) await upsert('tpas', { name: { equals: name } }, { name })
  for (const s of data.schemes) await upsert('schemes', { name: { equals: s.name } }, s)

  return { tenant: tenant as number, skipped: false }
}
