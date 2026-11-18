import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { tesserixAdmin } from './admin'
import { orderField } from './order'

/** The homepage "what we believe" cards. */
export const Beliefs: CollectionConfig = withApproval({
  slug: 'beliefs',
  admin: { ...tesserixAdmin, useAsTitle: 'title', defaultColumns: ['title', 'order'] },
  fields: [
    { name: 'label', type: 'text', required: true, admin: { description: 'Short eyebrow above the title, e.g. "Humans reply".' } },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    orderField,
  ],
})
