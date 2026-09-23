import 'dotenv/config';
import { Client } from 'pg';

// CMS version history (every publish / settings save snapshots its scope).
// Idempotent — safe to re-run. Service-role only: RLS enabled, no public
// policies, so anon/authenticated cannot read unpublished history.

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  await c.query(`
    create table if not exists public.cms_versions (
      id uuid primary key default gen_random_uuid(),
      scope text not null,
      snapshot jsonb not null,
      author_email text,
      summary text,
      created_at timestamptz not null default now()
    )
  `);
  await c.query(`create index if not exists cms_versions_scope_created_idx on public.cms_versions (scope, created_at desc)`);
  await c.query(`alter table public.cms_versions enable row level security`);
  console.log('cms_versions ready');
  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });
