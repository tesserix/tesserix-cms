import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

// Mirrors `testimonials` in yes-hospital/src/lib/data.ts.
export const Testimonials: CollectionConfig = withApproval({
  slug: 'testimonials',
  admin: { ...yesHospitalAdmin, useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'videoId', type: 'text', required: true, admin: { description: 'YouTube video ID.' } },
    { name: 'language', type: 'text', admin: { description: 'Caption shown under the video, e.g. "Recovery story (Hindi)".' } },
  ],
})
