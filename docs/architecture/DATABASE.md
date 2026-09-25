# Database

PostgreSQL managed through **Supabase** SQL migrations.
Schema lives in `supabase/storefront.sql` and supporting
scripts under `supabase/`.

## Applying changes

```bash
# 1. Apply the schema + RLS + grants
psql "$DATABASE_URL" -f supabase/storefront.sql
psql "$DATABASE_URL" -f supabase/persistence.sql

# 2. Apply published-sections RPC (required for homepage)
psql "$DATABASE_URL" -f supabase/homepage-published-rpc.sql

# 3. Seed content
npx tsx supabase/seed-storefront.ts
```

## Core content tables (public read via RLS)

- **categories / editions / products / product_variants / collections / announcements** - catalog
- **navigation_items / promo_slides / banners / campaigns** - marketing
- **homepage_sections** - homepage sections; read via the
  `get_published_homepage_sections()` RPC only
- **site_settings** - store config; anon/authenticated may read
  only the storefront allowlist: `theme`, `header`, `footer`,
  `templates`, `shipping` (see `supabase/site-settings-rls.sql`)
- **reviews / offers** - public content
- **orders / coupons / admin_users / media_assets / analytics_events** - admin/service-role only

## Seed data

`supabase/seed-storefront.ts` seeds all content rows
(categories, editions, products, navigation_items,
homepage_sections, site_settings, coupons, promo_slides,
banners, campaigns, reviews, offers).

## Homepage RPC

`src/app/page.tsx` loads sections through
`get_published_homepage_sections()`, which is defined in
`supabase/homepage-published-rpc.sql`. Without this function
the homepage throws on fresh setup.
