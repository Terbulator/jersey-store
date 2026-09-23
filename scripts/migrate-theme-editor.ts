import 'dotenv/config';
import { Client } from 'pg';

// Adds draft/publish columns to homepage_sections for the theme editor.
// Idempotent — safe to re-run.

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  await c.query(`
    alter table public.homepage_sections
      add column if not exists draft_enabled boolean,
      add column if not exists draft_sort_order int,
      add column if not exists draft_settings jsonb
  `);
  console.log('draft columns ready');
  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });