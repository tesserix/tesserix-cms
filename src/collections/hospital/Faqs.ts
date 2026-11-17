import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

// Mirrors `faqs` in yes-hospital/src/lib/data.ts.
export const Faqs: CollectionConfig = withApproval({
  slug: 'faqs',
  admin: { ...yesHospitalAdmin, useAsTitle: 'question' },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
  ],
})
