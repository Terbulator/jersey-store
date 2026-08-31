import { Role } from '@prisma/client';

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
