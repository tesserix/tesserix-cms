import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

// Mirrors `insurers` (a string list) in yes-hospital/src/lib/data.ts.
export const Insurers: CollectionConfig = withApproval({
  slug: 'insurers',
  admin: { ...yesHospitalAdmin, useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
  ],
})
