import 'dotenv/config';
import { Client } from 'pg';

// Security: audit trail + unpublished-draft protection. Idempotent.

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();

  await c.query(`
    create table if not exists public.audit_logs (
      id uuid primary key default gen_random_uuid(),
      actor_email text,
      actor_role text,
      action text not null,
      resource text not null,
      resource_id text,
      summary text,
      created_at timestamptz not null default now()
    )
  `);
  await c.query(`create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc)`);
  await c.query(`create index if not exists audit_logs_resource_idx on public.audit_logs (resource, created_at desc)`);
  await c.query(`alter table public.audit_logs enable row level security`);

  // Unpublished drafts must not be world-readable: revoke direct anon access
  // and expose a locked-down RPC that returns live columns only.
  await c.query(`revoke select on public.homepage_sections from anon, authenticated`);
  await c.query(`
    create or replace function public.get_published_homepage_sections()
    returns table (id uuid, key text, name text, enabled boolean, sort_order int, settings jsonb, updated_at timestamptz)
    language sql security definer set search_path = public stable as $$
      select id, key, name, enabled, sort_order, settings, updated_at
      from public.homepage_sections order by sort_order
    $$
  `);
  await c.query(`grant execute on function public.get_published_homepage_sections() to anon, authenticated`);

  console.log('security tables ready');
  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });
