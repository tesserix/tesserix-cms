import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { Users } from './collections/Users'

const isTest = process.env.NODE_ENV === 'test'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  graphQL: { disable: true },
  admin: { user: Users.slug },
  collections: [Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: { connectionString: (isTest ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL) || '' },
    push: true, // shortcut: schema push until migrations land in Task 7
  }),
})
