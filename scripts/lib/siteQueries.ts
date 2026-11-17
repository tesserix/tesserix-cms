/** The collections yes-hospital/src/lib/cms.ts reads, and its exact anonymous query string for each. */
export const SITE_COLLECTIONS = ['hospital-info', 'departments', 'doctors', 'testimonials', 'videos', 'faqs', 'insurers', 'tpas', 'schemes'] as const

export const siteQuery = (collection: string) => `/${collection}?where[tenant.slug][equals]=yes-hospital&depth=1&limit=0&sort=createdAt`
