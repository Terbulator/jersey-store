import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();

  try {
    const b = await c.query('select * from storage.buckets limit 5');
    console.log('BUCKETS:', JSON.stringify(b.rows, null, 2));
  } catch (e: any) { console.log('buckets error:', e.message); }

  const t = await c.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  console.log('TABLES:');
  t.rows.forEach((r: any) => console.log(' ', r.table_name));

  const hs = await c.query("select column_name, data_type from information_schema.columns where table_name='homepage_sections' order by ordinal_position");
  console.log('HOMEPAGE_SECTIONS:');
  hs.rows.forEach((r: any) => console.log(' ', r.column_name, r.data_type));

  await c.end();
}

main().then(() => process.exit(0)).catch((err: any) => { console.error(err.message); process.exit(1); });
