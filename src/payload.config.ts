import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { gcsStorage } from '@payloadcms/storage-gcs'
import { buildConfig, type Field } from 'payload'
import sharp from 'sharp'
import { isApprover, isSuperAdmin } from './access/roles'
import { Departments } from './collections/hospital/Departments'
import { Doctors } from './collections/hospital/Doctors'
import { Faqs } from './collections/hospital/Faqs'
import { HospitalInfo } from './collections/hospital/HospitalInfo'
import { Insurers } from './collections/hospital/Insurers'
import { Schemes } from './collections/hospital/Schemes'
import { Testimonials } from './collections/hospital/Testimonials'
import { Tpas } from './collections/hospital/Tpas'
import { Videos } from './collections/hospital/Videos'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'

const isTest = process.env.NODE_ENV === 'test'

/**
 * The tenant's slug, copied onto each of the user's `tenants` rows so synchronous checks such as
 * `admin.hidden` (see hiddenUnlessTenant) can read it from the unpopulated `req.user`.
 * shortcut: refreshed only when the user is saved; if a tenant's slug is ever renamed, re-save its users.
 */
const tenantSlugField: Field = {
  name: 'tenantSlug',
  type: 'text',
  admin: { hidden: true },
  hooks: {
    beforeChange: [
      async ({ siblingData, req }) => {
        const id = typeof siblingData.tenant === 'object' && siblingData.tenant ? siblingData.tenant.id : siblingData.tenant
        if (!id) return null
        const tenant = await req.payload.findByID({ collection: 'tenants', id, depth: 0, req, disableErrors: true })
        return tenant?.slug ?? null
      },
    ],
  },
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  graphQL: { disable: true },
  admin: { user: Users.slug },
  collections: [
    Users,
    Tenants,
    Media,
    // YES Hospital
    HospitalInfo,
    Departments,
    Doctors,
    Testimonials,
    Videos,
    Faqs,
    Insurers,
    Tpas,
    Schemes,
  ],
  editor: lexicalEditor(),
  sharp, // image sizes (card, profile) for media
  // Without a key (tests, local, build) Payload logs emails to the console instead.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM || 'cms@tesserix.app',
        defaultFromName: 'Tesserix CMS',
      })
    : undefined,
  // Getters defer env checks to Payload init / DB connect, so `next build` works without them.
  get secret() {
    return requireEnv('PAYLOAD_SECRET')
  },
  db: postgresAdapter({
    pool: {
      get connectionString() {
        return requireEnv(isTest ? 'DATABASE_URL_TEST' : 'DATABASE_URL')
      },
    },
    push: true, // shortcut: schema push until migrations land in Task 7
  }),
  plugins: [
    // Only with a bucket: tests and local dev keep files on disk. No credentials here: the Google
    // client uses Application Default Credentials (Workload Identity in the cluster).
    gcsStorage({
      enabled: Boolean(process.env.GCS_BUCKET),
      bucket: process.env.GCS_BUCKET ?? '',
      options: {},
      // Serve from the bucket's public URL; bucket-level public read (uniform access) makes that work.
      collections: { media: { disablePayloadAccessControl: true } },
    }),
    multiTenantPlugin({
      // Every content collection must be listed here, or it is not tenant-scoped.
      collections: {
        media: {},
        'hospital-info': { isGlobal: true },
        departments: {},
        doctors: {},
        testimonials: {},
        videos: {},
        faqs: {},
        insurers: {},
        tpas: {},
        schemes: {},
      },
      userHasAccessToAllTenants: isSuperAdmin,
      tenantsArrayField: {
        // Approvers may assign tenants; Users' beforeChange hook limits them to their own.
        arrayFieldAccess: {
          create: ({ req }) => isSuperAdmin(req.user) || isApprover(req.user),
          update: ({ req }) => isSuperAdmin(req.user) || isApprover(req.user),
        },
        rowFields: [tenantSlugField],
      },
    }),
  ],
})
