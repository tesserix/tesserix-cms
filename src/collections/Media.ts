import { APIError, type CollectionBeforeOperationHook, type CollectionConfig } from 'payload'
import { canApprove } from '../access/roles'

const MAX_BYTES = 5 * 1024 * 1024

// Payload 3.93 has no per-collection filesizeLimit, so check the uploaded file here, before it is processed.
const limitSize: CollectionBeforeOperationHook = ({ args, req }) => {
  // Trust the buffer, not the declared size. URL sources are off (`pasteURL: false`), so every upload arrives as req.file.
  if (req.file && Math.max(req.file.size, req.file.data?.length ?? 0) > MAX_BYTES) throw new APIError('Images must be 5 MB or smaller.', 400)
  return args
}

// Tenant field and tenant-scoped access come from the multi-tenant plugin (which ANDs the user's tenants onto `read`).
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Published pages show these images to anonymous visitors; any files are public by design.
    read: () => true,
    // Editors may add media; replacing or deleting existing files would change live pages without approval.
    update: ({ req }) => canApprove(req.user),
    delete: ({ req }) => canApprove(req.user),
  },
  hooks: { beforeOperation: [limitSize] },
  upload: {
    staticDir: 'media',
    pasteURL: false, // no fetching files from URLs: it would bypass the size check
    // Payload sniffs the file's bytes against these, so a PDF renamed to .jpg is refused too.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      { name: 'card', width: 640, formatOptions: { format: 'webp' } },
      { name: 'profile', width: 1000, formatOptions: { format: 'webp' } },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    {
      // Object-key folder in the bucket. Always the tenant's slug, never taken from input. Also set on local disk.
      name: 'prefix',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      hooks: {
        beforeChange: [
          async ({ data, originalDoc, req }) => {
            const t = data?.tenant ?? originalDoc?.tenant
            const id = typeof t === 'object' && t ? t.id : t
            if (!id) throw new APIError('A media file needs a tenant.', 400)
            const slug = (await req.payload.findByID({ collection: 'tenants', id, depth: 0, req, disableErrors: true }))?.slug
            if (!slug) throw new APIError('Unknown tenant.', 400)
            return slug
          },
        ],
      },
    },
    {
      // The GCS plugin adds this column only when enabled, so declare it here: the schema (and the
      // migrations) must be the same with and without GCS_BUCKET. `alwaysInsertFields` would do it,
      // but storage-gcs 3.93 returns before reading it when disabled. The plugin replaces this copy when on.
      name: '_objectKey',
      type: 'text',
      admin: { disableBulkEdit: true, disableGroupBy: true, disableListColumn: true, disableListFilter: true, hidden: true, readOnly: true },
    },
  ],
}
