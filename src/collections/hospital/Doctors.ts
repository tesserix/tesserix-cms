import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'

// shortcut: stub with only `name`, extended in Task 4. Tenant field and access come from the multi-tenant plugin.
export const Doctors: CollectionConfig = withApproval({
  slug: 'doctors',
  admin: { useAsTitle: 'name' },
  fields: [{ name: 'name', type: 'text', required: true }],
})
