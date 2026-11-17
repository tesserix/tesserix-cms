import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { yesHospitalAdmin } from './admin'

// Mirrors `videos` in data.ts; its `id` is `youtubeId` here, as `id` is Payload's own.
export const Videos: CollectionConfig = withApproval({
  slug: 'videos',
  admin: { ...yesHospitalAdmin, useAsTitle: 'title' },
  fields: [
    { name: 'youtubeId', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
  ],
})
