import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// These tests assert two things that are easy to break silently:
//   1. The hardening migration really contains the RLS/grant fixes.
//   2. Every admin API route is actually guarded, and the service-role client is
//      only constructed after that guard.
//
// This is a static check on purpose. The previous suite required a live Supabase
// project and created real users and orders; it could not run in CI and it wrote to
// whatever database the local .env pointed at.

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

/** SQL with `--` comments stripped, so prose cannot satisfy or trip a pattern. */
const sql = (p: string) =>
  read(p)
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n');

const migration = sql('supabase/20261003_security-hardening.sql');
const storefrontSql = sql('supabase/storefront.sql');

/**
 * Matches a REVOKE whether written literally or wrapped in a DO block as
 * `execute 'revoke ...'` (the trailing quote before `;` is what differs).
 */
const revokePattern = (fn: string, grantees: string) =>
  new RegExp(`revoke all on function public\\.${fn}\\([^)]*\\) from ${grantees}'?;`);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir))) {
    const full = join(dir, entry);
    if (statSync(join(root, full)).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const adminRoutes = walk('src/app/api/admin').filter((f) => f.endsWith('route.ts'));
const allRoutes = walk('src/app/api').filter((f) => f.endsWith('route.ts'));

// ---------------------------------------------------------------------------
// RLS and grants
// ---------------------------------------------------------------------------

describe('supabase RLS hardening', () => {
  test('orders keeps RLS on and stays unreadable by anon/authenticated', () => {
    assert.ok(migration.includes('alter table public.orders enable row level security'));
    assert.ok(
      /revoke select, insert, update, delete on public\.orders from anon, authenticated;/.test(migration)
    );
  });

  test('the unrestricted public reviews policy is dropped', () => {
    // `using (true)` on reviews plus a second `status='approved'` policy would be
    // OR'd together, exposing every review row and customer_email to the anon key.
    assert.ok(
      migration.includes('drop policy if exists "public read reviews" on public.reviews'),
      'the blanket reviews read policy must be dropped'
    );
    assert.ok(migration.includes("using (status = 'approved')"));
  });

  test('reviews are never granted a public column that carries an email address', () => {
    const grant = storefrontSql.slice(storefrontSql.indexOf('grant select (id, product_id'));
    const block = grant.slice(0, grant.indexOf(';'));
    assert.equal(block.includes('customer_email'), false, 'customer_email must not be publicly selectable');
  });

  test('reviews are absent from the blanket public-read loop in storefront.sql', () => {
    const loop = storefrontSql.slice(storefrontSql.indexOf('foreach t in array array['));
    const list = loop.slice(0, loop.indexOf(']'));
    assert.equal(list.includes("'reviews'"), false, 'reviews must not get a using(true) policy');
  });

  test('the security-definer coupon increment function is revoked from anon', () => {
    // SECURITY DEFINER functions are EXECUTE-able by PUBLIC by default and PostgREST
    // exposes them at /rest/v1/rpc/*, so without this any anonymous client could burn
    // a coupon's whole usage limit.
    assert.ok(revokePattern('increment_coupon_usage', 'anon, authenticated').test(migration));
    assert.ok(revokePattern('increment_coupon_usage', 'public').test(migration));
  });

  test('a fresh install of storefront.sql applies the same revokes', () => {
    assert.ok(revokePattern('increment_coupon_usage', 'anon, authenticated').test(storefrontSql));
    assert.ok(revokePattern('increment_coupon_usage', 'public').test(storefrontSql));
  });

  test('the new checkout helper functions are service-role only', () => {
    for (const fn of ['redeem_coupon', 'reserve_order_stock', 'release_order_stock']) {
      assert.ok(revokePattern(fn, 'public').test(migration), `${fn} must revoke the default PUBLIC grant`);
      assert.ok(revokePattern(fn, 'anon, authenticated').test(migration), `${fn} must revoke anon/authenticated`);
    }
  });

  test('every security-definer function pins its search_path', () => {
    const definer = migration.slice(migration.indexOf('create or replace function public.redeem_coupon'));
    for (const block of definer.split('$$;')) {
      if (!block.includes('security definer')) continue;
      assert.ok(block.includes('set search_path = public'), 'SECURITY DEFINER without a pinned search_path');
    }
  });

  test('every table holding private data has RLS enabled', () => {
    for (const table of ['orders', 'admin_users', 'media_assets', 'coupons', 'analytics_events', 'homepage_sections']) {
      assert.ok(
        new RegExp(`alter table public\\.${table} enable row level security`).test(migration),
        `${table} must have RLS enabled`
      );
      assert.ok(
        new RegExp(`revoke select on public[^;]*\\b${table}\\b`).test(migration) ||
          new RegExp(`\\b${table}\\b[^;]*from anon, authenticated`).test(migration),
        `${table} must revoke the anon select grant`
      );
    }
  });

  test('the public analytics INSERT policy is bounded, not using (true)', () => {
    const policy = migration.slice(migration.indexOf('create policy "anyone insert analytics"'));
    const block = policy.slice(0, policy.indexOf(');'));
    assert.equal(block.includes('with check (true)'), false);
    assert.ok(block.includes("event in ('page_view'"), 'event names must be allowlisted');
    assert.ok(block.includes('length(coalesce(page_url'), 'field lengths must be bounded');
  });

  test('the tracking token is backfilled and uniquely indexed', () => {
    assert.ok(migration.includes('update public.orders') && migration.includes('tracking_token = encode(digest('));
    assert.ok(migration.includes('create unique index if not exists orders_tracking_token_key'));
    assert.ok(migration.includes('where tracking_token is not null'));
  });

  test('the migration is additive: it drops no table or column', () => {
    assert.equal(/drop table/i.test(migration), false);
    assert.equal(/truncate/i.test(migration), false);
    assert.equal(/drop column/i.test(migration), false);
  });

  test('stock reservation and coupon redemption are atomic', () => {
    assert.ok(migration.includes('for update'), 'row locks are required to prevent oversell/race');
    assert.ok(migration.includes('stock = stock - v_qty'));
    assert.ok(migration.includes('create or replace function public.redeem_coupon'));
  });
});

// ---------------------------------------------------------------------------
// Route-level authorization coverage
// ---------------------------------------------------------------------------

describe('every admin API route is authorized', () => {
  test('the audit actually found routes to check', () => {
    assert.ok(adminRoutes.length >= 20, `expected many admin routes, found ${adminRoutes.length}`);
  });

  for (const file of adminRoutes) {
    const rel = relative(join(root, 'src/app/api/admin'), file).replace(/\\/g, '/');
    const source = read(file);

    test(`${rel} guards its handlers`, () => {
      // Either the route builds handlers through makeCrudApi (which authorizes in
      // the shared helper) or it calls authorize() itself in each handler.
      const usesCrudFactory = source.includes('makeCrudApi');
      assert.ok(
        usesCrudFactory || source.includes('await authorize('),
        `${rel} never calls authorize() and does not use makeCrudApi`
      );
    });

    test(`${rel} does not construct the service-role client before authorizing`, () => {
      if (source.includes('makeCrudApi')) return; // guarded inside the factory
      const guardIndex = source.indexOf('await authorize(');
      const clientIndex = source.search(/adminDataClient\(|serviceClient\(/);
      if (clientIndex === -1) return; // no service-role use in this file
      assert.ok(
        guardIndex !== -1 && guardIndex < clientIndex,
        `${rel} touches the service-role client before authorizing`
      );
    });
  }
});

describe('service-role key containment', () => {
  const sourceFiles = walk('src').filter((f) => /\.(ts|tsx)$/.test(f));

  test('the key is referenced in exactly one server module', () => {
    const hits = sourceFiles.filter((f) => read(f).includes('SUPABASE_SERVICE_ROLE_KEY'));
    assert.deepEqual(hits.map((h) => relative(root, h).replace(/\\/g, '/')), ['src/lib/admin-session.ts']);
  });

  test('it is never given a NEXT_PUBLIC_ prefix', () => {
    for (const file of sourceFiles) {
      assert.equal(
        /NEXT_PUBLIC_[A-Z_]*SERVICE_ROLE/.test(read(file)),
        false,
        `${file} exposes the service-role key under a NEXT_PUBLIC_ name`
      );
    }
  });

  test('.env.example documents the key as server-only', () => {
    const example = read('.env.example');
    assert.ok(example.includes('SUPABASE_SERVICE_ROLE_KEY'));
    assert.equal(/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/.test(example), false);
  });

  test('no client component imports the service-role module', () => {
    for (const file of sourceFiles.filter((f) => f.endsWith('.tsx'))) {
      const source = read(file);
      if (!source.includes("'use client'")) continue;
      assert.equal(
        /from '@\/lib\/(admin|admin-session)'/.test(source),
        false,
        `${relative(root, file)} is a client component importing the service-role module`
      );
    }
  });

  test('the client supabase helper only ever uses the anon key', () => {
    const client = read('src/lib/supabase/client.ts');
    assert.equal(client.includes('SERVICE_ROLE'), false);
    assert.ok(client.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  });

  test('no API route echoes the key into a response', () => {
    for (const file of allRoutes) {
      const source = read(file);
      assert.equal(
        /SERVICE_ROLE_KEY[\s\S]{0,200}NextResponse\.json/.test(source),
        false,
        `${relative(root, file)} may leak the key in a response`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Checkout invariants
// ---------------------------------------------------------------------------

describe('checkout route computes money server-side', () => {
  const orders = read('src/app/api/orders/route.ts');

  test('Math.random is not used for order numbers or tokens', () => {
    assert.equal(/Math\.random/.test(orders), false, 'orders route must not use Math.random');
  });

  test('the order schema rejects unknown fields', () => {
    // Otherwise a client could send price/total/discount/tracking_token and have it
    // ignored at best, or honoured at worst.
    assert.ok(orders.includes('.strict()'));
  });

  test('the client cannot supply a tracking token', () => {
    const schema = orders.slice(orders.indexOf('const orderSchema'), orders.indexOf('const badRequest'));
    assert.equal(schema.includes('trackingToken'), false);
  });

  test('payment status is server-owned', () => {
    assert.ok(orders.includes("payment_status: 'PENDING'"));
    assert.ok(orders.includes("status: 'PENDING'"));
  });

  test('an idempotent replay only returns the order to the original requester', () => {
    assert.ok(orders.includes('sameRequester'));
  });

  test('stock is reserved through an atomic database call', () => {
    assert.ok(orders.includes("rpc('reserve_order_stock'"));
  });

  test('coupon redemption goes through the locked RPC', () => {
    assert.ok(orders.includes("rpc('redeem_coupon'"));
  });

  test('the tracking endpoint is rate limited', () => {
    assert.ok(orders.includes("checkRateLimit(req, 'tracking')"));
  });

  test('the tracking response is marked no-store', () => {
    assert.ok(orders.includes("'Cache-Control': 'no-store, private'"));
  });
});

describe('admin CRUD factory', () => {
  const crud = read('src/lib/admin-crud.ts');

  test('a rejected field value cannot silently fall through to defaults', () => {
    // Regression guard: `...(coerce(...) ?? {})` used to turn a validation failure
    // into a defaults-only INSERT.
    assert.equal(/coerce\(spec, body\) \?\?/.test(crud), false);
    assert.ok(crud.includes('if (coerced === null)'));
  });

  test('updated_at is only written for tables that have the column', () => {
    assert.ok(crud.includes('hasUpdatedAt'));
    assert.ok(crud.includes('if (spec.hasUpdatedAt !== false)'));
    // media_assets has no updated_at column.
    assert.ok(read('src/app/api/admin/media/route.ts').includes('hasUpdatedAt: false'));
  });

  test('every makeCrudApi spec declares write and remove permissions', () => {
    const specs = walk('src/app/api/admin').filter(
      (f) => f.endsWith('route.ts') && read(f).includes('makeCrudApi({')
    );
    assert.ok(specs.length >= 6, `expected several crud routes, found ${specs.length}`);
    for (const file of specs) {
      const block = read(file).slice(read(file).indexOf('makeCrudApi({'));
      assert.ok(/\bwrite:\s*'[a-z_]+:[a-z]+'/.test(block), `${file} is missing a write permission`);
      assert.ok(/\bremove:\s*'[a-z_]+:[a-z]+'/.test(block), `${file} is missing a remove permission`);
    }
  });

  test('the crud factory rejects ids that are not uuids', () => {
    assert.ok(crud.includes('const UUID ='));
    assert.ok(crud.includes('Missing or invalid id.'));
  });
});

describe('admin pages do not rely on middleware alone', () => {
  test('the admin layout authorizes server-side', () => {
    const layout = read('src/app/admin/layout.tsx');
    assert.ok(layout.includes('requireAdmin'));
  });

  test('middleware only gates the admin surface at the routing layer', () => {
    // Documented expectation: middleware is a UX redirect, not the security control.
    const middleware = read('src/middleware.ts');
    assert.ok(middleware.includes("'/admin/:path*'"));
  });
});