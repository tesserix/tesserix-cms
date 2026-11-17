import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { isApprover, isSuperAdmin } from './access/roles'
import { Doctors } from './collections/hospital/Doctors'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'

const isTest = process.env.NODE_ENV === 'test'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  graphQL: { disable: true },
  admin: { user: Users.slug },
  collections: [Users, Tenants, Doctors, Media],
  editor: lexicalEditor(),
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
    multiTenantPlugin({
      // Every content collection must be listed here, or it is not tenant-scoped.
      collections: { doctors: {}, media: {} },
      userHasAccessToAllTenants: isSuperAdmin,
      tenantsArrayField: {
        // Approvers may assign tenants; Users' beforeChange hook limits them to their own.
        arrayFieldAccess: {
          create: ({ req }) => isSuperAdmin(req.user) || isApprover(req.user),
          update: ({ req }) => isSuperAdmin(req.user) || isApprover(req.user),
        },
      },
    }),
  ],
})
