import 'dotenv/config';
import { Client } from 'pg';

// Allows multiple instances of the same section (duplicate sections) and
// staged row deletion in drafts. Idempotent — safe to re-run.
// - drops the UNIQUE constraint on homepage_sections.key (rows are
//   identified by id; render order comes from sort_order)
// - adds draft_deleted so "delete then save draft" stages the deletion
//   without touching live content until publish

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  await c.query(`alter table public.homepage_sections drop constraint if exists homepage_sections_key_key`);
  await c.query(`alter table public.homepage_sections add column if not exists draft_deleted boolean`);
  await c.query(`create index if not exists homepage_sections_sort_order_idx on public.homepage_sections (sort_order)`);
  console.log('section instances ready');
  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });
