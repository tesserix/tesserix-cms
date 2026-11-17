import type { Payload } from 'payload'

/**
 * Creates the super-admin if no user has that email. Never changes an existing account, so a
 * re-run of the Job cannot reset a password that has since been changed in the admin.
 */
export async function createSuperAdmin(payload: Payload, { email, password }: { email?: string; password?: string }) {
  if (!email) throw new Error('SUPER_ADMIN_EMAIL is not set')
  if (!password || password.length < 12) throw new Error('SUPER_ADMIN_PASSWORD must be at least 12 characters')
  const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email.toLowerCase() } }, limit: 1, depth: 0, overrideAccess: true })
  if (docs[0]) {
    payload.logger.info(`createSuperAdmin: ${docs[0].email} already exists (${docs[0].role}); left unchanged`)
    return docs[0]
  }
  const user = await payload.create({ collection: 'users', data: { email, password, role: 'super-admin' }, overrideAccess: true })
  payload.logger.info(`createSuperAdmin: created ${user.email}`)
  return user
}
