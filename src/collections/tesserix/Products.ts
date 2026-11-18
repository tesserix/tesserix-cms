import type { CollectionConfig } from 'payload'
import { withApproval } from '../../access/approval'
import { slugField } from '../../fields/slug'
import { tesserixAdmin } from './admin'
import { ICONS } from './icons'
import { orderField } from './order'

const INDUSTRIES = ['commerce', 'food', 'rentals', 'healthcare', 'nutrition', 'travel']

// Fields mirror `Product` in tesserix-home/apps/web/lib/cms/types.ts; the site derives badge
// artwork from `listings.platform` and image orientation from the media's dimensions.
export const Products: CollectionConfig = withApproval({
  slug: 'products',
  admin: { ...tesserixAdmin, useAsTitle: 'title', defaultColumns: ['title', 'status', 'order'] },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'title', type: 'text', required: true },
    ...slugField('title'),
    { name: 'tagline', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true, admin: { description: 'One or two sentences; also the page description for search engines.' } },
    { name: 'longDescription', type: 'textarea' },
    { name: 'icon', type: 'select', options: [...ICONS], defaultValue: 'Package', required: true },
    {
      name: 'status',
      type: 'select',
      // Payload's drafts enum is already called enum_products_status.
      enumName: 'enum_products_launch_status',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Coming soon', value: 'coming-soon' },
      ],
      defaultValue: 'coming-soon',
      required: true,
      admin: { position: 'sidebar', description: 'Flipping to Available launches the product on the site and emails its waitlist.' },
    },
    { name: 'industry', type: 'select', options: INDUSTRIES, required: true, admin: { position: 'sidebar' } },
    { name: 'eta', type: 'text', admin: { description: 'Honest launch target for a coming-soon product, e.g. "Early 2027". Leave empty rather than guess.' } },
    { name: 'highlights', type: 'text', hasMany: true, admin: { description: 'Short bullets for the /products rows and homepage cards.' } },
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'icon', type: 'select', options: [...ICONS], defaultValue: 'Package', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'benefits', type: 'text', hasMany: true },
    { name: 'website', type: 'text', admin: { description: "The product's own site. Pricing lives there." } },
    { name: 'pricingUrl', type: 'text', admin: { description: 'Public pricing page, if there is one.' } },
    { name: 'ctaLabel', type: 'text', admin: { description: 'Primary button on the detail page, available products only. Must match where the website goes.' } },
    { name: 'ctaSubtext', type: 'text' },
    { name: 'trialLine', type: 'text', admin: { description: "The real trial offer, exactly as the product's site states it." } },
    { name: 'operatingSystem', type: 'text', admin: { description: 'For search engines; defaults to "Web". Set e.g. "iOS, Android" for mobile-only products.' } },
    {
      name: 'listings',
      type: 'array',
      admin: { description: 'App store presence. Leave the URL empty for a store listing that is not live yet.' },
      fields: [
        { name: 'platform', type: 'select', options: ['ios', 'android'], required: true },
        { name: 'url', type: 'text' },
      ],
    },
    { name: 'vendorListingUrl', type: 'text', admin: { description: 'A second Android app for the other side of the marketplace (Fe3dr home cooks).' } },
    { name: 'siteImage', type: 'upload', relationTo: 'media', admin: { description: 'Landscape capture of the live site. Shown for available products only.' } },
    { name: 'screenshots', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'Portrait phone screenshots, two or three.' } },
    orderField,
  ],
})
