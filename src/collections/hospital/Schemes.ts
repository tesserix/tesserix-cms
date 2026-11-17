import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

// Mirrors `schemes` in yes-hospital/src/lib/data.ts.
export const Schemes: CollectionConfig = withApproval({
  slug: 'schemes',
  admin: { ...yesHospitalAdmin, useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
  ],
})
