import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

/**
 * One document per tenant: the multi-tenant plugin's `isGlobal` makes the tenant field unique and
 * opens the single doc from the nav (see payload.config.ts). Fields mirror `hospitalInfo` in data.ts.
 */
export const HospitalInfo: CollectionConfig = withApproval({
  slug: 'hospital-info',
  labels: { singular: 'Hospital info', plural: 'Hospital info' },
  admin: { ...yesHospitalAdmin, useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'phones', type: 'text', hasMany: true },
    { name: 'emergencyPhones', type: 'text', hasMany: true },
    { name: 'emails', type: 'text', hasMany: true },
    { name: 'about', type: 'textarea' },
    { name: 'mission', type: 'textarea' },
    { name: 'vision', type: 'textarea' },
    { name: 'values', type: 'text', hasMany: true },
    { name: 'facilities', type: 'text', hasMany: true },
  ],
})
