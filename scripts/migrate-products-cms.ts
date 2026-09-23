import 'dotenv/config';
import { Client } from 'pg';

// Product CMS columns: SEO fields on products, color on variants.
// Idempotent — safe to re-run.

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  await c.query(`
    alter table public.products
      add column if not exists seo_title text,
      add column if not exists seo_description text,
      add column if not exists og_image text
  `);
  await c.query(`alter table public.product_variants add column if not exists color text`);
  console.log('product cms columns ready');
  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });
