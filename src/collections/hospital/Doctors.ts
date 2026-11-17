import type { CollectionConfig } from 'payload'
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
    { name: 'department', type: 'relationship', relationTo: 'departments', required: true },
    { name: 'qualification', type: 'text' },
    { name: 'languages', type: 'text', hasMany: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'opd', type: 'text', admin: { description: 'OPD timings, e.g. "Mon-Sat, 10am-2pm".' } },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
})
