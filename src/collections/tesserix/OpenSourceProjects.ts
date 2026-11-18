import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { tesserixAdmin } from './admin'
import { orderField } from './order'

/** Repos on github.com/tesserix shown on the homepage; the link is built from the name. */
export const OpenSourceProjects: CollectionConfig = withApproval({
  slug: 'open-source-projects',
  labels: { singular: 'Open-source project', plural: 'Open-source projects' },
  admin: { ...tesserixAdmin, useAsTitle: 'name', defaultColumns: ['name', 'order'] },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'The repository name under github.com/tesserix.' } },
    { name: 'description', type: 'textarea', required: true },
    orderField,
  ],
})
