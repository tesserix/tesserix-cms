import { Forbidden, ValidationError, type Access, type CollectionBeforeChangeHook, type CollectionConfig, type FieldAccess } from 'payload'
import { isApprover, isSuperAdmin, ROLES, userTenantIds } from '../access/roles'

// The multi-tenant plugin ANDs every result below with "own account, or shares one of my tenants".
const manageOthers: Access = ({ req: { user } }) => {
  if (isSuperAdmin(user)) return true
  if (isApprover(user)) return { role: { not_equals: 'super-admin' } }
  return false
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

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  access: {
    create: canManageUsers,
    // Editors may only edit their own account; role and tenants are locked by field access below.
    update: (args) => (args.req.user?.role === 'editor' ? { id: { equals: args.req.user.id } } : manageOthers(args)),
    delete: manageOthers,
    unlock: manageOthers,
  },
  hooks: { beforeChange: [guardRolesAndTenants] },
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
