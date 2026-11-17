import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities'
import type { Access, Payload, TypedUser } from 'payload'

export const ROLES = ['super-admin', 'approver', 'editor'] as const
export type Role = (typeof ROLES)[number]

type MaybeUser = (Partial<TypedUser> & { role?: Role | null }) | null | undefined

export const isSuperAdmin = (user: MaybeUser): boolean => user?.role === 'super-admin'
export const isApprover = (user: MaybeUser): boolean => user?.role === 'approver'

/** Tenant ids the user is assigned to (ids or populated docs both work). */
export const userTenantIds = (user: MaybeUser): (string | number)[] =>
  user ? getUserTenantIDs(user as TypedUser) : []

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user)

/** Emails of every approver assigned to the tenant. Not stored on the tenant, so it can never go stale. */
export async function getApproverEmails(payload: Payload, tenantId: string | number): Promise<string[]> {
  const { docs } = await payload.find({
    collection: 'users',
    where: { role: { equals: 'approver' }, 'tenants.tenant': { equals: tenantId } },
    pagination: false,
    depth: 0,
  })
  return docs.map((u) => u.email)
}

/** Approvers and super-admins may publish, unpublish, delete and write review notes. */
export const canApprove = (user: MaybeUser): boolean => isSuperAdmin(user) || isApprover(user)

/**
 * `admin.hidden` for a client's collections: shown only to users of the tenant with this slug
 * (and to super-admins). Reads the `tenantSlug` stored on each `tenants` row of the user, because
 * `hidden` is synchronous and `req.user` is not populated.
 */
export const hiddenUnlessTenant =
  (tenantSlug: string) =>
  ({ user }: { user: unknown }): boolean => {
    const u = user as MaybeUser & { tenants?: { tenantSlug?: string | null }[] | null }
    return !isSuperAdmin(u) && !u?.tenants?.some((row) => row.tenantSlug === tenantSlug)
  }
