import type { CollectionConfig } from 'payload'

// shortcut: local disk storage, replaced by object storage in Task 5. Tenant field and access come from the multi-tenant plugin.
export const Media: CollectionConfig = {
  slug: 'media',
  upload: { staticDir: 'media' },
  fields: [{ name: 'alt', type: 'text', required: true }],
}
