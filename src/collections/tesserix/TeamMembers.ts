import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { slugField } from '../../fields/slug'
import { tesserixAdmin } from './admin'
import { orderField } from './order'

// Mirrors `TeamMember` in tesserix-home/apps/web/lib/cms/types.ts.
export const TeamMembers: CollectionConfig = withApproval({
  slug: 'team-members',
  labels: { singular: 'Team member', plural: 'Team members' },
  admin: { ...tesserixAdmin, useAsTitle: 'name', defaultColumns: ['name', 'title', 'order'] },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', type: 'text', required: true },
    ...slugField('name'),
    { name: 'title', type: 'text', required: true },
    { name: 'bio', type: 'textarea', admin: { description: "Only what the person's public profiles actually say." } },
    { name: 'linkedIn', type: 'text', required: true },
    { name: 'github', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    orderField,
  ],
})
