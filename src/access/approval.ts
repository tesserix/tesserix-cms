import { Forbidden, type CollectionBeforeChangeHook, type CollectionBeforeOperationHook, type CollectionConfig, type Field } from 'payload'
import { reviewNote } from '../fields/reviewNote'
import { notifyApprovers } from '../hooks/notifyApprovers'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidateSite'
import { canApprove } from './roles'

/**
 * Role access for content collections. The multi-tenant plugin wraps each of these and ANDs in
 * the user's tenants, so these only decide by role.
 * - read: any signed-in user (plugin scopes to tenant); anonymous sees published docs only.
 * - create/update: any role, but only approvers may write `_status: 'published'`. Payload asks
 *   `update` with `_status: 'published'` to decide the admin Publish button and to authorize
 *   restoring a published version, so this one rule covers both.
 * - delete: approvers and above. readVersions: signed-in users only.
 */
export const approvalAccess = {
  read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  create: ({ req, data }) => Boolean(req.user?.role) && (canApprove(req.user) || data?._status !== 'published'),
  update: ({ req, data }) => Boolean(req.user?.role) && (canApprove(req.user) || data?._status !== 'published'),
  delete: ({ req }) => canApprove(req.user),
  readVersions: ({ req }) => Boolean(req.user?.role),
} satisfies CollectionConfig['access']

/** Throws unless the user may publish. No user means a trusted server-side call (e.g. the seed). */
export const canPublish = ({ req, data }: { req: Parameters<CollectionBeforeChangeHook>[0]['req']; data: { _status?: unknown } }) => {
  if (req.user && !canApprove(req.user) && data?._status === 'published') throw new Forbidden(req.t)
}

/**
 * Turns every non-approver write into a draft before Payload decides how to save it. Without
 * this, an editor's update with `draft: false` (the REST default) overwrites the live row even
 * with no `_status` in the body, and `_status: 'draft'` on a published doc unpublishes it.
 * Anonymous reads always use the live rows: with `draft: true` Payload filters the latest
 * version, so a doc with a pending draft would vanish from the public site.
 */
const forceDrafts: CollectionBeforeOperationHook = ({ args, operation, overrideAccess, req }) => {
  if (overrideAccess) return args
  if (!req.user) return operation === 'read' ? { ...args, draft: false } : args
  if (canApprove(req.user)) return args
  if ('data' in args && (args.data as { _status?: unknown } | undefined)?._status === 'published') throw new Forbidden(req.t)
  if (operation === 'create' || operation === 'update') {
    // The locale publish flags write the latest (published) version row even on a draft save.
    const { unpublishAllLocales, publishAllLocales, publishSpecificLocale, ...rest } = args as typeof args & Record<string, unknown>
    return { ...rest, draft: true }
  }
  // restoreVersion reads `draft` before this hook runs, so it can only be refused, not rewritten.
  if (operation === 'restoreVersion' && !args.draft) throw new Forbidden(req.t)
  return args
}

const publishGuard: CollectionBeforeChangeHook = ({ req, data }) => {
  canPublish({ req, data })
  return data
}

/** Who made this save, draft or publish. Always overwritten, so clients cannot set it; server calls record nobody. */
const recordUpdatedBy: CollectionBeforeChangeHook = ({ req, data }) => ({ ...data, updatedBy: req.user?.id ?? null })

// Editor identities are not for the public site: signed-in users only.
const updatedBy: Field = {
  name: 'updatedBy',
  type: 'relationship',
  relationTo: 'users',
  access: { read: ({ req }) => Boolean(req.user) },
  admin: { position: 'sidebar', readOnly: true, description: 'Who saved this version.' },
}

/**
 * Applies the approval workflow to a content collection: drafts and versions, role access,
 * the publish guard, the review note, who saved it (updatedBy), approver emails, and a status column in the list.
 */
export const withApproval = (config: CollectionConfig): CollectionConfig => ({
  ...config,
  access: { ...config.access, ...approvalAccess },
  versions: { drafts: { autosave: false }, maxPerDoc: 50 },
  admin: {
    ...config.admin,
    defaultColumns: [...(config.admin?.defaultColumns ?? [config.admin?.useAsTitle ?? 'id', 'updatedAt']), '_status'],
  },
  hooks: {
    ...config.hooks,
    beforeOperation: [...(config.hooks?.beforeOperation ?? []), forceDrafts],
    beforeChange: [...(config.hooks?.beforeChange ?? []), publishGuard, recordUpdatedBy],
    afterChange: [...(config.hooks?.afterChange ?? []), notifyApprovers, revalidateOnChange],
    afterDelete: [...(config.hooks?.afterDelete ?? []), revalidateOnDelete],
  },
  fields: [...config.fields, reviewNote, updatedBy],
})
