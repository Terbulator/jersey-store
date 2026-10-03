import 'server-only';

import { redirect } from 'next/navigation';
import { getAdminSession, type AdminSession } from '@/lib/admin-session';
import { hasPermission, isStaffRole, type Permission, type Role } from '@/lib/rbac';

// Page-level guards. These redirect (they render HTML), so API routes must use
// `@/lib/api-guard` instead — a redirect from a route handler answers with a 307
// to an HTML page rather than a 401/403 JSON body.

export type { AdminSession };
export { getAdminSession, adminDataClient } from '@/lib/admin-session';

export async function requireAdmin(): Promise<Exclude<AdminSession, { status: 'anonymous' | 'forbidden' }>> {
  const session = await getAdminSession();
  if (session.status === 'anonymous') redirect('/login?redirect=/admin');
  if (session.status === 'forbidden') redirect('/account');
  return session;
}

export async function requireOwner(): Promise<Exclude<AdminSession, { status: 'anonymous' | 'forbidden' }>> {
  const session = await requireAdmin();
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') redirect('/account');
  return session;
}

export async function requireWorker(): Promise<Exclude<AdminSession, { status: 'anonymous' | 'forbidden' }>> {
  const session = await requireAdmin();
  if (!isStaffRole(session.role)) redirect('/account');
  return session;
}

/** Throws on an unrecognised role string so callers never act on a bad value. */
export function checkPermission(
  session: Exclude<AdminSession, { status: 'anonymous' | 'forbidden' }>,
  permission: Permission
): void {
  if (!hasPermission(session.role, permission)) {
    throw new Error(`Forbidden: requires ${permission}`);
  }
}

export function checkPermissions(
  session: Exclude<AdminSession, { status: 'anonymous' | 'forbidden' }>,
  permissions: Permission[]
): void {
  for (const permission of permissions) checkPermission(session, permission);
}

export type { Permission, Role };