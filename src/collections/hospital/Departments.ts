import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { slugField } from '../../fields/slug'
import { yesHospitalAdmin } from './admin'

// Lucide icon names the site uses today. The site maps the name to the icon component.
const ICONS = ['Activity', 'Baby', 'Bone', 'Brain', 'Eye', 'Heart', 'Microscope', 'Pill', 'Stethoscope', 'Syringe']

// Fields mirror `Department` in yes-hospital/src/lib/data.ts. Its `doctors` count is derived, so not stored.
export const Departments: CollectionConfig = withApproval({
  slug: 'departments',
  admin: { ...yesHospitalAdmin, useAsTitle: 'name', defaultColumns: ['name', 'featured', 'featuredOrder'] },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', type: 'text', required: true },
    ...slugField('name'),
    { name: 'shortName', type: 'text' },
    { name: 'icon', type: 'select', options: ICONS, defaultValue: 'Stethoscope' },
    { name: 'description', type: 'textarea', required: true },
    { name: 'blurb', type: 'textarea' },
    { name: 'symptoms', type: 'text', hasMany: true, minRows: 3, required: true },
    { name: 'conditions', type: 'text', hasMany: true },
    { name: 'procedures', type: 'text', hasMany: true },
    {
      name: 'faqs',
      type: 'array',
      fields: [
        { name: 'q', label: 'Question', type: 'text', required: true },
        { name: 'a', label: 'Answer', type: 'textarea', required: true },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'featuredOrder',
      type: 'number',
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.featured), description: 'Lower comes first on the homepage.' },
    },
  ],
})
