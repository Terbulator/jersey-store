import type { User } from '@supabase/supabase-js';

// Role/permission model for the staff surface.
//
// `admin_users.role` in Postgres is an unconstrained text column, so `isRole`
// is the trust boundary: an unrecognised value is treated as "no permissions"
// (fail closed) rather than being cast through to a permissive role.

export const ROLES = ['CUSTOMER', 'OWNER', 'WORKER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export type Permission =
  // Orders
  | 'orders:read'
  | 'orders:read_all'
  | 'orders:write'
  | 'orders:update_status'
  // Catalog
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'inventory:read'
  | 'inventory:write'
  // Promotions
  | 'coupons:read'
  | 'coupons:write'
  | 'coupons:delete'
  // Site configuration
  | 'settings:read'
  | 'settings:write'
  | 'settings:read_private'
  | 'pages:read'
  | 'pages:write'
  | 'pages:delete'
  | 'theme:read'
  | 'theme:write'
  | 'homepage:write'
  | 'versions:read'
  | 'versions:restore'
  // Storefront merchandising content
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  // Media
  | 'media:read'
  | 'media:write'
  | 'media:delete'
  // Community
  | 'reviews:read'
  | 'reviews:write'
  | 'reviews:delete'
  // Customers & staff
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'admin_users:read'
  | 'admin_users:write'
  | 'admin_users:delete'
  // Reporting
  | 'analytics:read'
  | 'audit:read';

const ALL: Permission[] = [
  'orders:read',
  'orders:read_all',
  'orders:write',
  'orders:update_status',
  'products:read',
  'products:write',
  'products:delete',
  'inventory:read',
  'inventory:write',
  'coupons:read',
  'coupons:write',
  'coupons:delete',
  'settings:read',
  'settings:write',
  'settings:read_private',
  'pages:read',
  'pages:write',
  'pages:delete',
  'theme:read',
  'theme:write',
  'homepage:write',
  'versions:read',
  'versions:restore',
  'content:read',
  'content:write',
  'content:delete',
  'media:read',
  'media:write',
  'media:delete',
  'reviews:read',
  'reviews:write',
  'reviews:delete',
  'users:read',
  'users:write',
  'users:delete',
  'admin_users:read',
  'admin_users:write',
  'admin_users:delete',
  'analytics:read',
  'audit:read',
];

/**
 * WORKER is the day-to-day operations role: fulfil orders, adjust stock, upload
 * imagery, moderate reviews and edit merchandising copy. It deliberately does NOT
 * get pricing, discounts, site configuration, staff management or destructive
 * catalog/settings access.
 */
const WORKER_PERMISSIONS: Permission[] = [
  'orders:read',
  'orders:read_all',
  'orders:update_status',
  'products:read',
  'inventory:read',
  'inventory:write',
  'coupons:read',
  'settings:read',
  'pages:read',
  'content:read',
  'content:write',
  'content:delete',
  'media:read',
  'media:write',
  'reviews:read',
  'reviews:write',
];

const OWNER_PERMISSIONS: Permission[] = ALL.filter((p) => p !== 'admin_users:write' && p !== 'admin_users:delete');

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [],
  WORKER: WORKER_PERMISSIONS,
  OWNER: OWNER_PERMISSIONS,
  ADMIN: ALL,
};

export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role || !isRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissions(role: Role): Permission[] {
  return isRole(role) ? [...ROLE_PERMISSIONS[role]] : [];
}

/** Staff-side role check (CUSTOMER is never staff). */
export function isStaffRole(role: Role | undefined | null): boolean {
  return role === 'ADMIN' || role === 'OWNER' || role === 'WORKER';
}

/** Does this role satisfy every listed permission? */
export function hasEveryPermission(role: Role | undefined | null, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Ownership check for a single order row.
 *
 * Staff with `orders:read_all` see every order; a customer may only ever see an
 * order whose `user_id` matches their own auth uid.
 */
export function canAccessOrder(
  role: Role | undefined | null,
  permissions: readonly Permission[],
  orderUserId: string | null,
  currentUserId: string
): boolean {
  if (isStaffRole(role)) return permissions.includes('orders:read_all');
  if (role === 'CUSTOMER' && orderUserId) {
    return permissions.includes('orders:read') && orderUserId === currentUserId;
  }
  return false;
}

export type AuthenticatedActor = { user: User; role: Role };