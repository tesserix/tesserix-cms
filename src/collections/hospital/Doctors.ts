import type { CollectionConfig } from 'payload'
import { relationship } from 'payload/shared'
import { withApproval } from '../../access/approval'
import { slugField } from '../../fields/slug'
import { yesHospitalAdmin } from './admin'

// Tenant field and access come from the multi-tenant plugin. Fields mirror `Doctor` in yes-hospital/src/lib/data.ts.
export const Doctors: CollectionConfig = withApproval({
  slug: 'doctors',
  admin: { ...yesHospitalAdmin, useAsTitle: 'name', defaultColumns: ['name', 'department', 'active'] },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', type: 'text', required: true },
    ...slugField('name'),
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      // A published doctor must not point at a department the public site cannot see.
      validate: async (value: unknown, options: Parameters<typeof relationship>[1]) => {
        const base = await relationship(value as never, options) // keeps the required and exists-and-readable checks
        if (base !== true) return base
        const { siblingData, req } = options
        if (!value || (siblingData as { _status?: string })._status !== 'published') return true
        const id = typeof value === 'object' ? (value as { id: number }).id : (value as number)
        // Local API reads are unrestricted by default and return the live row; the relation itself is checked by Payload.
        const dept = await req.payload.findByID({ collection: 'departments', id, depth: 0, draft: false, req, disableErrors: true })
        return !dept || dept._status === 'published' || 'The department must be published before a doctor in it can be published.'
      },
    },
    { name: 'qualification', type: 'text' },
    { name: 'languages', type: 'text', hasMany: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'opd', type: 'text', admin: { description: 'OPD timings, e.g. "Mon-Sat, 10am-2pm".' } },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
})
