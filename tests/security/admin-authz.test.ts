import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { authorize } from '@/lib/api-guard';
import { getPermissions, hasPermission, isRole, isStaffRole, type Role } from '@/lib/rbac';
import type { AdminSession } from '@/lib/admin-session';

// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------

const fakeUser = (id: string) => ({ id } as never);

const session = (status: AdminSession['status'], role?: string, id = 'user-1'): AdminSession => {
  if (status === 'anonymous') return { status: 'anonymous' };
  if (status === 'forbidden') return { status: 'forbidden' };
  return { status: 'ok', user: fakeUser(id), role: role as Role };
};

const withSession = (s: AdminSession) => ({ resolveSession: async () => s });

// ---------------------------------------------------------------------------
// 1. Unauthenticated callers are rejected with 401
// ---------------------------------------------------------------------------

describe('admin API authorization', () => {
  test('unauthenticated caller gets 401 and no actor', async () => {
    const guard = await authorize({ permission: 'orders:read_all', ...withSession(session('anonymous')) });
    assert.equal(guard.ok, false);
    if (guard.ok) return;
    assert.equal(guard.response.status, 401);
  });

  test('unauthenticated caller is rejected even when no permission is named', async () => {
    const guard = await authorize(withSession(session('anonymous')));
    assert.equal(guard.ok, false);
    if (!guard.ok) assert.equal(guard.response.status, 401);
  });

  // -------------------------------------------------------------------------
  // 2. Authenticated non-staff get 403, not access
  // -------------------------------------------------------------------------

  test('normal authenticated user with no admin_users row gets 403', async () => {
    const guard = await authorize({ permission: 'orders:read', ...withSession(session('forbidden')) });
    assert.equal(guard.ok, false);
    if (!guard.ok) assert.equal(guard.response.status, 403);
  });

  test('a CUSTOMER role can never reach a service-role query', async () => {
    // Even if a row in admin_users somehow said CUSTOMER, the guard refuses.
    const guard = await authorize(withSession(session('ok', 'CUSTOMER')));
    assert.equal(guard.ok, false);
    if (!guard.ok) assert.equal(guard.response.status, 403);
  });

  test('an unrecognised role string fails closed', async () => {
    // admin_users.role is unconstrained text; an unexpected value must not become
    // a permissive role.
    const guard = await authorize(withSession(session('ok', 'SUPERUSER')));
    assert.equal(guard.ok, false);
    if (!guard.ok) assert.equal(guard.response.status, 403);
  });

  // -------------------------------------------------------------------------
  // 3. Vertical privilege escalation between staff roles
  // -------------------------------------------------------------------------

  test('WORKER is refused permissions reserved for OWNER/ADMIN', async () => {
    const worker = withSession(session('ok', 'WORKER'));
    for (const permission of [
      'settings:write',
      'settings:read_private',
      'coupons:write',
      'coupons:delete',
      'products:write',
      'products:delete',
      'pages:write',
      'theme:write',
      'versions:restore',
      'media:delete',
      'users:write',
      'admin_users:write',
      'admin_users:delete',
      'audit:read',
    ] as const) {
      const guard = await authorize({ permission, ...worker });
      assert.equal(guard.ok, false, `WORKER must not hold ${permission}`);
      if (!guard.ok) assert.equal(guard.response.status, 403);
    }
  });

  test('WORKER keeps the operational permissions it is meant to have', async () => {
    const worker = withSession(session('ok', 'WORKER'));
    for (const permission of [
      'orders:read_all',
      'orders:update_status',
      'inventory:read',
      'inventory:write',
      'products:read',
      'media:write',
      'reviews:write',
      'content:write',
      'settings:read',
    ] as const) {
      const guard = await authorize({ permission, ...worker });
      assert.equal(guard.ok, true, `WORKER should hold ${permission}`);
    }
  });

  test('OWNER is refused staff administration but keeps site configuration', async () => {
    const owner = withSession(session('ok', 'OWNER'));
    const grant = await authorize({ permission: 'admin_users:write', ...owner });
    assert.equal(grant.ok, false);

    const settings = await authorize({ permission: 'settings:write', ...owner });
    assert.equal(settings.ok, true);
  });

  // -------------------------------------------------------------------------
  // 4. Admins can reach permitted endpoints
  // -------------------------------------------------------------------------

  test('ADMIN is allowed every permission in the matrix', async () => {
    const admin = withSession(session('ok', 'ADMIN'));
    for (const permission of getPermissions('ADMIN')) {
      const guard = await authorize({ permission, ...admin });
      assert.equal(guard.ok, true, `ADMIN should hold ${permission}`);
    }
  });

  test('ADMIN is allowed when several permissions are required at once', async () => {
    const guard = await authorize({
      permissions: ['orders:update_status', 'orders:read'],
      ...withSession(session('ok', 'ADMIN')),
    });
    assert.equal(guard.ok, true);
    if (guard.ok) {
      assert.equal(guard.actor.role, 'ADMIN');
      assert.equal(guard.actor.user.id, 'user-1');
    }
  });

  test('requiring several permissions fails if any one is missing', async () => {
    const guard = await authorize({
      permissions: ['inventory:write', 'products:write'],
      ...withSession(session('ok', 'WORKER')),
    });
    assert.equal(guard.ok, false);
  });

  test('a permission check with no requirement only proves staff membership', async () => {
    const guard = await authorize(withSession(session('ok', 'WORKER')));
    assert.equal(guard.ok, true);
  });
});

// ---------------------------------------------------------------------------
// 5. Role string handling
// ---------------------------------------------------------------------------

describe('role validation', () => {
  test('only the four known roles are accepted', () => {
    for (const role of ['CUSTOMER', 'OWNER', 'WORKER', 'ADMIN']) {
      assert.equal(isRole(role), true, role);
    }
    for (const role of ['', 'admin', 'ADMIN ', 'ROOT', null, undefined, 42, {}]) {
      assert.equal(isRole(role), false, JSON.stringify(role));
    }
  });

  test('only ADMIN/OWNER/WORKER count as staff', () => {
    assert.equal(isStaffRole('ADMIN'), true);
    assert.equal(isStaffRole('OWNER'), true);
    assert.equal(isStaffRole('WORKER'), true);
    assert.equal(isStaffRole('CUSTOMER'), false);
    assert.equal(isStaffRole(undefined), false);
  });

  test('CUSTOMER holds no permissions at all', () => {
    assert.deepEqual(getPermissions('CUSTOMER'), []);
  });

  test('hasPermission rejects an unknown role rather than defaulting to true', () => {
    assert.equal(hasPermission('GHOST' as Role, 'orders:read'), false);
    assert.equal(hasPermission(undefined, 'orders:read'), false);
  });

  test('ADMIN is a strict superset of WORKER', () => {
    for (const permission of getPermissions('WORKER')) {
      assert.equal(hasPermission('ADMIN', permission), true, permission);
    }
  });
});