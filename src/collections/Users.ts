import { Forbidden, ValidationError, type Access, type CollectionBeforeChangeHook, type CollectionBeforeOperationHook, type CollectionConfig, type FieldAccess, type Where } from 'payload'
import { isApprover, isSuperAdmin, ROLES, userTenantIds } from '../access/roles'

/**
 * The multi-tenant plugin ANDs every result below with "own account, or shares one of my tenants".
 * Sharing one tenant is not enough to manage someone: an approver of A who could reset the password
 * of an A+B user could log in as them and reach B. So approvers only manage users whose tenants are
 * all their own (and never super-admins).
 */
const manageOthers: Access = async ({ req }) => {
  const { user } = req
  if (isSuperAdmin(user)) return true
  if (!user || !isApprover(user)) return false
  // An array `not_in` matches users with at least one tenant outside mine.
  const { docs } = await req.payload.find({
    collection: 'users',
    where: { 'tenants.tenant': { not_in: userTenantIds(user) } },
    select: {},
    depth: 0,
    pagination: false,
    req,
  })
  const scope: Where = {
    or: [
      { id: { equals: user.id } },
      { and: [{ role: { not_equals: 'super-admin' } }, { id: { not_in: docs.map((d) => d.id) } }] },
    ],
  }
  return scope
}

const canManageUsers: FieldAccess & Access = ({ req: { user } }) => isSuperAdmin(user) || isApprover(user)

const ids = (rows: unknown): string[] =>
  userTenantIds({ tenants: Array.isArray(rows) ? rows : [] } as never).map(String)

/**
 * Blocks privilege escalation that collection access cannot see, because it depends on the
 * submitted values: approvers may not grant super-admin or change tenants outside their own;
 * editors may not change role or tenants at all (field access already strips these; this is the backstop).
 */
const guardRolesAndTenants: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const actor = req.user
  const role = 'role' in data ? data.role : originalDoc?.role
  const next = ids('tenants' in data ? data.tenants : originalDoc?.tenants)

  if (actor && !isSuperAdmin(actor)) {
    const prev = ids(originalDoc?.tenants)
    const roleChanged = role !== originalDoc?.role
    const changedTenants = [...next.filter((t) => !prev.includes(t)), ...prev.filter((t) => !next.includes(t))]
    const mine = ids(actor.tenants)
    if (!isApprover(actor) && (roleChanged || changedTenants.length)) throw new Forbidden(req.t)
    if (role === 'super-admin' && roleChanged) throw new Forbidden(req.t)
    if (changedTenants.some((t) => !mine.includes(t))) throw new Forbidden(req.t)
  }

  if (role !== 'super-admin' && next.length === 0) {
    throw new ValidationError({
      collection: 'users',
      errors: [{ message: 'Approvers and editors must belong to at least one tenant.', path: 'tenants' }],
    })
  }
  return data
}

/**
 * Payload's first-user registration (`POST /api/users/first-register`, behind the admin's
 * create-first-user screen) creates with `overrideAccess: true`, so `access.create` never sees it:
 * on an empty DB anyone could claim a super-admin. Only server-side (Local API) code may create a
 * user without one signed in; the first super-admin comes from scripts/create-super-admin.ts.
 */
const noAnonymousCreate: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === 'create' && !req.user && req.payloadAPI !== 'local') throw new Forbidden(req.t)
  return args
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  // Secure only in production: local dev serves the admin over plain http.
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000, cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' } },
  access: {
    create: canManageUsers,
    // Editors may only edit their own account; role and tenants are locked by field access below.
    update: (args) => (args.req.user?.role === 'editor' ? { id: { equals: args.req.user.id } } : manageOthers(args)),
    delete: manageOthers,
    unlock: manageOthers,
  },
  hooks: { beforeOperation: [noAnonymousCreate], beforeChange: [guardRolesAndTenants] },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [...ROLES],
      saveToJWT: true,
      access: { create: canManageUsers, update: canManageUsers },
    },
    // `tenants` is added by the multi-tenant plugin (see payload.config.ts).
  ],
}
