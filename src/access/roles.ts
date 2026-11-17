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
