import 'dotenv/config';
import { Client } from 'pg';

// Adds the offers table (already in storefront.sql) to a live DB that predates it.
// Idempotent: runs the same DDL + RLS + grants, then seeds offers only if empty.

const OFFERS_DDL = `
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  badge text,
  code text,
  discount_text text,
  image text,
  cta_text text,
  cta_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offers enable row level security;

drop policy if exists "public read offers" on public.offers;
create policy "public read offers" on public.offers for select using (true);

grant select on public.offers to anon, authenticated;
grant all on public.offers to service_role;
`;

const OFFERS_SEED = [
  {
    title: 'WELCOME OFFER',
    subtitle: '10% off your first order. No code needed.',
    badge: 'NEW',
    discount_text: '10% OFF',
    active: true,
    sort_order: 1,
  },
  {
    title: 'JERSEY SALE',
    subtitle: 'Up to 30% off player versions.',
    badge: 'SALE',
    code: 'JERSEY15',
    discount_text: '15% OFF ₹1,499+',
    active: true,
    sort_order: 2,
  },
  {
    title: 'BUNDLE DEAL',
    subtitle: 'Extra 10% off when you bundle 3+ items.',
    code: 'BUNDLE10',
    discount_text: '10% OFF BUNDLES',
    active: false,
    sort_order: 3,
  },
];

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  console.log('Connected.');

  await c.query(OFFERS_DDL);
  console.log('offers DDL + RLS + grants applied.');

  const count = await c.query('select count(*)::int as n from public.offers');
  if (count.rows[0].n === 0) {
    for (const [i, o] of OFFERS_SEED.entries()) {
      await c.query(
        `insert into public.offers (title, subtitle, badge, code, discount_text, active, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [o.title, o.subtitle, o.badge, o.code ?? null, o.discount_text, o.active, o.sort_order]
      );
    }
    console.log(`Seeded ${OFFERS_SEED.length} offers.`);
  } else {
    console.log(`offers already populated (${count.rows[0].n} rows), skipping seed.`);
  }

  await c.end();
  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });