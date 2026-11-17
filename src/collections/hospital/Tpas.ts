import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

// Mirrors `tpas` (a string list) in yes-hospital/src/lib/data.ts.
export const Tpas: CollectionConfig = withApproval({
  slug: 'tpas',
  admin: { ...yesHospitalAdmin, useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
  ],
})
