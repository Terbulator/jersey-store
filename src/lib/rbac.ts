import { Role, GrantAccess } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    'users.view', 'users.create', 'users.update', 'users.delete',
    'owners.view', 'owners.approve', 'owners.suspend',
    'workers.view', 'workers.create', 'workers.update', 'workers.delete',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.update',
    'categories.view', 'categories.create', 'categories.update', 'categories.delete',
    'audit.view',
    'settings.view', 'settings.update',
    'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
  ],
  OWNER: [
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.update',
    'workers.view', 'workers.create', 'workers.update', 'workers.delete',
    'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
    'profile.view', 'profile.update',
  ],
  WORKER: [
    'tasks.view', 'tasks.update',
    'orders.view',
  ],
  CUSTOMER: [
    'products.view',
    'orders.view',
    'profile.view', 'profile.update',
  ],
};

export function can(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Permission decision for a real user, merging their base role permissions with
 * any active Owner-granted PermissionOverrides (see /owner/permissions).
 * - A DENY override always wins (blocks even base-granted access).
 * - A GRANT override can add a permission the role doesn't have by default.
 * - TEMPORARY overrides past expiresAt are ignored.
 */
export async function checkPermission(
  userId: string,
  role: Role,
  permission: string,
  baseAllowed = can(role, permission)
): Promise<boolean> {
  const overrides = await prisma.permissionOverride.findMany({
    where: { userId, permission },
  });

  let denied = false;
  let granted = false;
  for (const o of overrides) {
    if (o.expiresAt && o.expiresAt.getTime() < Date.now()) continue;
    if (o.access === GrantAccess.DENY) denied = true;
    else granted = true;
  }
  if (denied) return false;
  return baseAllowed || granted;
}
