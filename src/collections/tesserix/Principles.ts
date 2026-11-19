import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { tesserixAdmin } from './admin'
import { orderField } from './order'

/** Shown on /about ("How we work") and /careers ("What we look for"); numbered by position. */
export const Principles: CollectionConfig = withApproval({
  slug: 'principles',
  admin: { ...tesserixAdmin, useAsTitle: 'title', defaultColumns: ['title', 'order'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    orderField,
  ],
})
