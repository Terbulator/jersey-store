import 'dotenv/config';
import { Client } from 'pg';

// CMS content pages (Shipping, Returns, FAQ, …). Idempotent — safe to re-run.

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  await c.query(`
    create table if not exists public.site_pages (
      id uuid primary key default gen_random_uuid(),
      slug text unique not null,
      title text not null,
      blocks jsonb not null default '[]'::jsonb,
      published boolean not null default true,
      seo_title text,
      seo_description text,
      sort_order int not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await c.query(`alter table public.site_pages enable row level security`);
  await c.query(`drop policy if exists "public read published pages" on public.site_pages`);
  await c.query(`create policy "public read published pages" on public.site_pages for select using (published = true)`);
  console.log('site_pages ready');
  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });
