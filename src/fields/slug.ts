import { Forbidden, ValidationError, type Field, type FieldHook } from 'payload'
import { canApprove } from '../access/roles'

/** Lowercase `a-z0-9-` only, dashes collapsed and trimmed. Typed and generated slugs both go through it. */
export const slugify = (v: unknown) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const idOf = (v: unknown) => (typeof v === 'object' && v ? (v as { id: unknown }).id : v)

/**
 * Fills, de-duplicates and locks the slug. A field hook rather than `validate`, because Payload
 * skips validation on draft saves and a draft must not take another doc's slug either.
 */
const checkSlug =
  (useAsSlug: string): FieldHook =>
  async ({ value, data, originalDoc, operation, collection, req }) => {
    // Not `required` (so the generated types let callers omit it): an empty slug keeps the current
    // one, or is generated. It can never be cleared, which would also dodge the lock below.
    const slug = slugify(value) || originalDoc?.slug || slugify(data?.[useAsSlug] ?? originalDoc?.[useAsSlug])
    if (!slug) return value

    // Live URLs may already be linked, so once a doc has ever been published only approvers may move it.
    if (operation === 'update' && slug !== originalDoc?.slug && originalDoc?.hasBeenPublished) {
      if (req.user && !canApprove(req.user)) throw new Forbidden(req.t)
    }

    const tenant = idOf(data?.tenant ?? originalDoc?.tenant)
    if (tenant && collection) {
      const id = operation === 'update' ? originalDoc?.id : undefined
      const { docs } = await req.payload.find({
        collection: collection.slug as 'doctors',
        // draft: true searches latest versions, so a pending draft holds its slug too.
        where: { and: [{ tenant: { equals: tenant } }, { slug: { equals: slug } }, ...(id ? [{ id: { not_equals: id } }] : [])] },
        draft: true,
        limit: 1,
        pagination: false,
        depth: 0,
        req,
      })
      if (docs.length) {
        throw new ValidationError({
          collection: collection.slug,
          errors: [{ message: `The slug "${slug}" is already used in this tenant.`, path: 'slug' }],
        })
      }
    }
    return slug
  }

/**
 * A URL slug, unique per tenant, generated from `useAsSlug` when left empty. Editors cannot change
 * it once the doc has ever been published; approvers can. Pair it with
 * `indexes: [{ fields: ['tenant', 'slug'], unique: true }]` for the database-level guarantee.
 * Returns three fields: the slug, the `hasBeenPublished` flag it reads, and `previousSlugs`, the
 * slugs a published doc was renamed from, so the site can redirect its old URLs. A new slug may
 * equal another doc's previous slug: the site matches current slugs first, so that redirect ends.
 */
export const slugField = (useAsSlug = 'name'): Field[] => [
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: { position: 'sidebar', description: `Used in the page URL. Generated from the ${useAsSlug} if left empty.` },
    hooks: {
      beforeValidate: [checkSlug(useAsSlug)],
      // The copy must not take the source's slug; the editor renames it before it is published.
      beforeDuplicate: [({ value }) => (value ? `${value}-copy` : value)],
    },
  },
  {
    // Derived, never taken from input: once true it stays true (versions are pruned, so they cannot be the record).
    name: 'hasBeenPublished',
    type: 'checkbox',
    defaultValue: false,
    admin: { hidden: true },
    hooks: {
      beforeChange: [
        ({ data, originalDoc, operation }) =>
          data?._status === 'published' || (operation === 'update' && Boolean(originalDoc?.hasBeenPublished)),
      ],
    },
  },
  {
    // Derived, never taken from input. Public: the site reads it to redirect old URLs.
    name: 'previousSlugs',
    type: 'text',
    hasMany: true,
    admin: { hidden: true, readOnly: true },
    hooks: {
      beforeChange: [
        ({ siblingData, originalDoc, operation }) => {
          if (operation !== 'update') return []
          const old: string[] = [...(originalDoc?.previousSlugs ?? []), ...(originalDoc?.hasBeenPublished && originalDoc.slug ? [originalDoc.slug] : [])]
          return [...new Set(old)].filter((s) => s !== siblingData.slug)
        },
      ],
    },
  },
]
