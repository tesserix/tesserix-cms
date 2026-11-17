import type { CollectionAfterChangeHook } from 'payload'
import { canApprove, getApproverEmails } from '../access/roles'

const HOUR = 60 * 60 * 1000

/**
 * Emails the tenant's approvers when an editor saves a draft, at most once per document per hour.
 * The throttle lives in Payload's DB-backed KV store (`payload-kv`), so it holds across pods.
 * A failed email is logged and never fails the save.
 */
export const notifyApprovers: CollectionAfterChangeHook = async ({ doc, collection, req }) => {
  const { user, payload } = req
  if (!user || canApprove(user) || doc._status !== 'draft') return doc
  try {
    const key = `approval-notified:${collection.slug}:${doc.id}`
    const last = await payload.kv.get<{ at: number }>(key)
    if (last && Date.now() - last.at < HOUR) return doc

    const tenantId = typeof doc.tenant === 'object' && doc.tenant ? doc.tenant.id : doc.tenant
    if (!tenantId) return doc
    const to = await getApproverEmails(payload, tenantId)
    if (!to.length) return doc
    const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0, req })

    const label = typeof collection.labels.singular === 'string' ? collection.labels.singular : collection.slug
    const title = String(doc[collection.admin.useAsTitle ?? 'id'] ?? doc.id)
    const editor = user.name ? `${user.name} <${user.email}>` : user.email
    const link = `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? ''}/admin/collections/${collection.slug}/${doc.id}`
    await payload.sendEmail({
      to,
      subject: `[${tenant.name}] ${label} "${title}" is waiting for approval`,
      text: [
        `${editor} saved changes to ${label} "${title}" for ${tenant.name}.`,
        'They are not live until an approver publishes them.',
        '',
        `Review: ${link}`,
      ].join('\n'),
    })
    await payload.kv.set(key, { at: Date.now() })
  } catch (err) {
    payload.logger.error({ err, msg: `notifyApprovers failed for ${collection.slug}/${doc.id}` })
  }
  return doc
}
