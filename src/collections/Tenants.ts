import type { CollectionConfig, TextFieldSingleValidation } from 'payload'
import { isSuperAdmin, superAdminOnly } from '../access/roles'

/** https anywhere; plain http only to in-cluster services, where the site is reached without TLS. */
const revalidateUrl: TextFieldSingleValidation = (value) => {
  if (!value) return true
  try {
    const { protocol, hostname } = new URL(value)
    if (protocol === 'https:' || (protocol === 'http:' && hostname.endsWith('.svc.cluster.local'))) return true
  } catch {
    // not a URL
  }
  return 'The revalidate URL must be https:// (http:// only for *.svc.cluster.local hosts).'
}

const superAdminRead = { read: ({ req }: { req: { user?: unknown } }) => isSuperAdmin(req.user as never) }

/**
 * Public read: Payload checks read access on every hop of a query path, so the sites' anonymous
 * `where[tenant.slug][equals]=...` needs it. Anonymous callers see only name, slug and siteUrl; the
 * multi-tenant plugin still narrows signed-in users to their own tenants. Writes are super-admin only.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name' },
  access: { read: () => true, create: superAdminOnly, update: superAdminOnly, delete: superAdminOnly },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'siteUrl', type: 'text' },
    { name: 'revalidateUrl', type: 'text', validate: revalidateUrl, access: superAdminRead },
    {
      name: 'webhookSecret',
      type: 'text',
      access: superAdminRead,
      admin: { description: 'Shared secret for revalidation webhooks. Visible to super-admins only.' },
    },
  ],
}
