import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'
import { COMMIT_POLLS, COMMIT_POLL_MS, detach, sleep } from './notifyApprovers'

type Doc = { id: number | string; _status?: string; slug?: string; updatedAt: string; tenant?: unknown }

/**
 * Tells the tenant's site to revalidate when live content changes: a publish, an unpublish, or
 * the delete of a published doc. Draft saves of a published doc leave the live row alone, so they
 * stay silent. POSTs `{ collection, slug?, previousSlug? }` to the tenant's `revalidateUrl` with
 * `x-cms-secret` (`previousSlug` is added when a publish renamed the slug, so the old URL is
 * revalidated too; collections without a slug, like hospital-info, omit both).
 *
 * Like notifyApprovers, the call is detached and waits for the change to be visible on another
 * connection (committed), so a slow or failing site never delays or fails the save and a rolled
 * back save never fires. Failures are logged (never with the secret); the site's own expiry covers them.
 */
const fire = ({ payload, collection, doc, previousSlug, deleted }: { payload: Payload; collection: string; doc: Doc; previousSlug?: string; deleted?: boolean }) =>
  detach(
    (async () => {
      for (let i = 0; ; i++) {
        await sleep(COMMIT_POLL_MS)
        const latest = (await payload.findByID({ collection: collection as 'doctors', id: doc.id as number, depth: 0, disableErrors: true })) as Doc | null
        if (deleted ? !latest : latest && latest._status === doc._status && new Date(latest.updatedAt) >= new Date(doc.updatedAt)) break
        if (i + 1 >= COMMIT_POLLS) return // rolled back or superseded: nothing went live from this save
      }
      const tenantId = typeof doc.tenant === 'object' && doc.tenant ? (doc.tenant as { id: number }).id : (doc.tenant as number)
      const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0, overrideAccess: true })
      if (!tenant.revalidateUrl) return payload.logger.debug(`revalidateSite: ${tenant.slug} has no revalidateUrl`)
      const body = { collection, ...(doc.slug ? { slug: doc.slug } : {}), ...(previousSlug ? { previousSlug } : {}) }
      const timeout = Number(process.env.REVALIDATE_TIMEOUT_MS) || 5000
      const res = await fetch(tenant.revalidateUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-cms-secret': tenant.webhookSecret ?? '' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      })
      if (!res.ok) payload.logger.error(`revalidateSite: ${tenant.slug} ${collection} responded ${res.status}`)
    })().catch((err) => payload.logger.error({ err: String(err), msg: `revalidateSite failed for ${collection}/${doc.id}` })),
  )

export const revalidateOnChange: CollectionAfterChangeHook = ({ doc, previousDoc, collection, operation, req }) => {
  const wasLive = operation === 'update' && previousDoc?._status === 'published'
  if (doc._status !== 'published' && !(wasLive && doc._status === 'draft')) return doc
  const previousSlug = doc._status === 'published' && wasLive && previousDoc.slug && previousDoc.slug !== doc.slug ? previousDoc.slug : undefined
  fire({ payload: req.payload, collection: collection.slug, doc, previousSlug })
  return doc
}

export const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc, collection, req }) => {
  if (doc._status === 'published') fire({ payload: req.payload, collection: collection.slug, doc, deleted: true })
  return doc
}
