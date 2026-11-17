import type { CollectionAfterChangeHook, Payload } from 'payload'
import { canApprove, getApproverEmails } from '../access/roles'

const HOUR = 60 * 60 * 1000
const COMMIT_POLL_MS = 200
const COMMIT_POLLS = 10

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Args = Parameters<CollectionAfterChangeHook>[0]

/**
 * Emails the tenant's approvers when an editor saves a draft, at most once per document per hour.
 * The throttle lives in Payload's DB-backed KV store (`payload-kv`), so it holds across pods.
 *
 * The hook runs inside the save's transaction, so the email is sent from a detached task that
 * first waits for the save to become visible on a separate connection (i.e. committed). A save
 * that rolls back never emails. Approvers are addressed by bcc so they do not see each other.
 * A failed email is logged, never fails the save, and releases the hour so the next save retries.
 */
export const notifyApprovers: CollectionAfterChangeHook = async ({ doc, collection, req }) => {
  const { user, payload } = req
  if (!user || canApprove(user) || doc._status !== 'draft') return doc
  const key = `approval-notified:${collection.slug}:${doc.id}`
  try {
    // The KV adapter does not use the request's transaction, so this claim is visible at once.
    const last = await payload.kv.get<{ at: number }>(key)
    if (last && Date.now() - last.at < HOUR) return doc
    await payload.kv.set(key, { at: Date.now() })
  } catch (err) {
    payload.logger.error({ err, msg: `notifyApprovers failed for ${collection.slug}/${doc.id}` })
    return doc
  }
  const task = sendWhenCommitted({ payload, collection, doc, user, key })
    .catch(async (err) => {
      payload.logger.error({ err, msg: `notifyApprovers failed for ${collection.slug}/${doc.id}` })
      await payload.kv.delete(key).catch(() => undefined)
    })
    .finally(() => pending.delete(task))
  pending.add(task)
  return doc
}

const pending = new Set<Promise<void>>()

/** Resolves once every detached approver email has been sent or given up (for tests and shutdown). */
export const notificationsSettled = async (): Promise<void> => {
  while (pending.size) await Promise.all(pending)
}

async function sendWhenCommitted({
  payload,
  collection,
  doc,
  user,
  key,
}: Pick<Args, 'collection' | 'doc'> & { payload: Payload; user: NonNullable<Args['req']['user']>; key: string }) {
  for (let i = 0; ; i++) {
    await sleep(COMMIT_POLL_MS)
    // No `req`: outside the save's transaction, the new draft is only visible once committed.
    const latest = await payload.findByID({ collection: collection.slug, id: doc.id, draft: true, depth: 0, disableErrors: true })
    if (latest && new Date((latest as { updatedAt: string }).updatedAt) >= new Date(doc.updatedAt)) break
    if (i + 1 >= COMMIT_POLLS) {
      await payload.kv.delete(key) // rolled back (or never committed): no email, and the hour is free again
      return
    }
  }

  const tenantId = typeof doc.tenant === 'object' && doc.tenant ? doc.tenant.id : doc.tenant
  if (!tenantId) return
  const bcc = await getApproverEmails(payload, tenantId)
  if (!bcc.length) return
  const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0 })

  const label = typeof collection.labels.singular === 'string' ? collection.labels.singular : collection.slug
  const title = String(doc[collection.admin.useAsTitle ?? 'id'] ?? doc.id)
  const editor = user.name ? `${user.name} <${user.email}>` : user.email
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL
  const linkable = Boolean(base && /^https?:\/\//.test(base))
  if (!linkable) payload.logger.warn('notifyApprovers: PAYLOAD_PUBLIC_SERVER_URL is not an absolute URL; sending without a review link')

  await payload.sendEmail({
    // Resend requires a To; the approvers go in bcc.
    to: payload.email.defaultFromAddress,
    bcc,
    subject: `[${tenant.name}] ${label} "${title}" is waiting for approval`,
    text: [
      `${editor} saved changes to ${label} "${title}" for ${tenant.name}.`,
      'They are not live until an approver publishes them.',
      ...(linkable ? ['', `Review: ${base!.replace(/\/$/, '')}/admin/collections/${collection.slug}/${doc.id}`] : []),
    ].join('\n'),
  })
}
