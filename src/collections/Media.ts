import { APIError, type CollectionBeforeOperationHook, type CollectionConfig } from 'payload'

const MAX_BYTES = 5 * 1024 * 1024

// Payload 3.93 has no per-collection filesizeLimit, so check the uploaded file here, before it is processed.
const limitSize: CollectionBeforeOperationHook = ({ args, req }) => {
  if (req.file && req.file.size > MAX_BYTES) throw new APIError('Images must be 5 MB or smaller.', 400)
  return args
}

// Tenant field and tenant-scoped access come from the multi-tenant plugin (which ANDs the user's tenants onto `read`).
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Published pages show these images to anonymous visitors; any files are public by design.
    read: () => true,
  },
  hooks: { beforeOperation: [limitSize] },
  upload: {
    staticDir: 'media',
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
            if (!id) return originalDoc?.prefix
            return (await req.payload.findByID({ collection: 'tenants', id, depth: 0, req, disableErrors: true }))?.slug
          },
        ],
      },
    },
  ],
}
