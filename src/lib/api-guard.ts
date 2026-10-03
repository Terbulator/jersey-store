import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getAdminSession, type AdminSession } from '@/lib/admin-session';
import { getPermissions, hasEveryPermission, isStaffRole, type Permission, type Role } from '@/lib/rbac';

// Every admin/privileged API route funnels through here BEFORE it touches the
// service-role client. The guard answers three separate questions and never
// collapses them:
//   1. Is there a valid Supabase auth session?  -> 401
//   2. Does that user hold a staff row in admin_users? -> 403
//   3. Does the staff role hold the required permission? -> 403
// Anything else (unknown role string, admin_users lookup error) fails closed.

export type ApiActor = { user: User; role: Role; permissions: readonly Permission[] };

export type GuardOptions = {
  /** Permissions the caller must hold. Defaults to a single permission. */
  permission?: Permission;
  permissions?: Permission[];
  /**
   * Session resolver override. Production routes omit this; the test suite injects
   * a fake so the authorization boundary can be exercised without a live Supabase.
   */
  resolveSession?: () => Promise<AdminSession>;
};

export type GuardResult = { ok: true; actor: ApiActor } | { ok: false; response: NextResponse };

const unauthorized = () =>
  NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

const forbidden = () => NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

export async function authorize(options: GuardOptions = {}): Promise<GuardResult> {
  const resolve = options.resolveSession ?? getAdminSession;
  const session = await resolve();

  if (session.status === 'anonymous') return { ok: false, response: unauthorized() };
  if (session.status === 'forbidden') return { ok: false, response: forbidden() };

  const { user, role } = session;

  // Defence in depth: the resolver already validates the role string, but a
  // CUSTOMER or unrecognised role must never reach a service-role query.
  if (!isStaffRole(role)) return { ok: false, response: forbidden() };

  const required = options.permissions ?? (options.permission ? [options.permission] : []);
  if (required.length > 0 && !hasEveryPermission(role, required)) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, actor: { user, role, permissions: getPermissions(role) } };
}

/**
 * Guard that requires every permission in `permissions`.
 * Usage:  const guard = await requirePermissions(['products:write', 'media:write']);
 *         if (!guard.ok) return guard.response;
 */
export function requirePermissions(permissions: Permission[], options: Omit<GuardOptions, 'permission' | 'permissions'> = {}) {
  return authorize({ ...options, permissions });
}

/** Guard for a single permission. */
export function requirePermission(permission: Permission, options: Omit<GuardOptions, 'permission' | 'permissions'> = {}) {
  return authorize({ ...options, permission });
}