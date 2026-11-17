import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionSlug, Payload, Where } from 'payload'
import * as data from './data'

const photosDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'photos')

/**
 * Loads YES Hospital's current site content into the CMS, all published. It is a first-time
 * bootstrap: if tenant `yes-hospital` already exists it logs and returns without touching
 * anything, because a re-run would overwrite published edits and publish over pending drafts.
 * With SEED_FORCE=true it re-runs anyway: the tenant, departments and doctors are matched by slug,
 * media by alt text (Payload may suffix a filename that is taken), the rest by natural key, and
 * every match is overwritten with the seed's content, published. Nothing is duplicated.
 * Runs as a trusted server call (`overrideAccess`) and never emails approvers or pings the site.
 */
export async function seedYesHospital(payload: Payload): Promise<{ tenant: number; skipped: boolean }> {
  const opts = { overrideAccess: true, depth: 0, context: { skipNotifications: true } } as const

  const findOne = async (collection: CollectionSlug, where: Where) =>
    (await payload.find({ collection, where, limit: 1, pagination: false, draft: true, ...opts })).docs[0] as { id: number } | undefined

  // Tenant. Webhook settings come from env on first run and are only overwritten when set.
  const env = { revalidateUrl: process.env.SEED_REVALIDATE_URL || undefined, webhookSecret: process.env.SEED_WEBHOOK_SECRET || undefined }
  const tenantData = { name: 'YES Hospital & Research Centre', slug: 'yes-hospital', siteUrl: 'https://yeshospital.in', ...env }
  const existing = await findOne('tenants', { slug: { equals: 'yes-hospital' } })
  if (existing && process.env.SEED_FORCE !== 'true') {
    payload.logger.info('seed:yes-hospital: tenant yes-hospital already exists; nothing changed. Set SEED_FORCE=true to overwrite its content with the seed (published).')
    return { tenant: existing.id, skipped: true }
  }
  const tenant = existing
    ? (await payload.update({ collection: 'tenants', id: existing.id, data: tenantData, ...opts })).id
    : (await payload.create({ collection: 'tenants', data: tenantData, ...opts })).id

  const upsert = async (collection: CollectionSlug, key: Where, fields: Record<string, unknown>) => {
    const doc = await findOne(collection, { and: [{ tenant: { equals: tenant } }, key] })
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

  for (const t of data.testimonials) await upsert('testimonials', { videoId: { equals: t.videoId } }, t)
  for (const v of data.videos) await upsert('videos', { youtubeId: { equals: v.id } }, { youtubeId: v.id, title: v.title })
  for (const f of data.faqs) await upsert('faqs', { question: { equals: f.question } }, f)
  for (const name of data.insurers) await upsert('insurers', { name: { equals: name } }, { name })
  for (const name of data.tpas) await upsert('tpas', { name: { equals: name } }, { name })
  for (const s of data.schemes) await upsert('schemes', { name: { equals: s.name } }, s)

  return { tenant: tenant as number, skipped: false }
}
