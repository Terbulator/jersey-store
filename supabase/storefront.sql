-- HEADERR Admin Command Center + storefront CMS schema
-- Idempotent migration. Content tables: public SELECT via RLS (anon/authenticated),
-- writes happen server-side with the service role key (bypasses RLS).
-- Personal tables (orders, admin_users, analytics events): no public policies.

create extension if not exists pgcrypto;

-- ============================================================
-- CONTENT TABLES (public read only)
-- ============================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  image text,
  label text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  edition text not null,
  team text,
  season text,
  badge text,
  price numeric(10,2) not null default 0,
  compare_price numeric(10,2),
  image text,
  image_alt text,
  images jsonb not null default '[]'::jsonb,
  description text,
  fit text,
  material text,
  care text,
  sizes jsonb not null default '["S","M","L","XL","XXL"]'::jsonb,
  shipping_note text,
  returns_note text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  sku text,
  price numeric(10,2),
  stock int not null default 0,
  low_stock_threshold int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  product_slugs jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  link text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  section text not null default 'main', -- main | mobile | footer-shop | footer-support | footer-follow | footer-about
  label text not null,
  href text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promo_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  headline text not null,
  subheadline text,
  desktop_image text,
  mobile_image text,
  cta_text text,
  cta_url text,
  start_at timestamptz,
  end_at timestamptz,
  status text not null default 'draft', -- draft | scheduled | active | expired
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  eyebrow text,
  headline text,
  copy text,
  image text,
  cta_text text,
  cta_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image text,
  cta_text text,
  cta_url text,
  status text not null default 'draft', -- draft | scheduled | active | expired
  start_at timestamptz,
  end_at timestamptz,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  enabled boolean not null default true,
  sort_order int not null default 0,
  settings jsonb not null default '{}'::jsonb,
  draft_enabled boolean,
  draft_sort_order int,
  draft_settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PERSONAL / ADMIN TABLES (service-role only access)
-- ============================================================

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role text not null default 'ADMIN', -- ADMIN | OWNER | WORKER
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text,
  address jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'PENDING', -- PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED
  payment_method text not null default 'COD',
  payment_status text not null default 'PENDING', -- PENDING | PAID | FAILED | REFUNDED
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  product_variant text,
  customer_name text not null,
  customer_email text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  verified_buyer boolean not null default false,
  status text not null default 'pending', -- pending | approved | rejected
  featured boolean not null default false,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null default 'percent', -- percent | fixed
  value numeric(10,2) not null default 0,
  min_spend numeric(10,2),
  max_discount numeric(10,2),
  max_uses int,
  used_count int not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  alt text,
  kind text not null default 'image', -- image | video
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

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

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null, -- page_view | product_view | add_to_cart | remove_from_cart | begin_checkout | purchase
  user_id uuid references auth.users(id) on delete set null,
  product_id text,
  product_name text,
  category text,
  price numeric(10,2),
  page_url text,
  referrer text,
  device text,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_edition on public.products(edition);
create index if not exists idx_products_published on public.products(published);
create index if not exists idx_product_variants_product on public.product_variants(product_id);
create index if not exists idx_orders_created on public.orders(created_at);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_analytics_event on public.analytics_events(event);
create index if not exists idx_analytics_created on public.analytics_events(created_at);

-- ============================================================
-- RLS
-- ============================================================

alter table public.categories enable row level security;
alter table public.editions enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.collections enable row level security;
alter table public.announcements enable row level security;
alter table public.navigation_items enable row level security;
alter table public.promo_slides enable row level security;
alter table public.banners enable row level security;
alter table public.campaigns enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.site_settings enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.media_assets enable row level security;
alter table public.coupons enable row level security;
alter table public.offers enable row level security;
alter table public.analytics_events enable row level security;

-- Public content: anyone with anon/authenticated key can SELECT.
-- Writes are service-role only (no write policies exist).
do $$
declare t text;
begin
  foreach t in array array['categories','editions','products','product_variants','collections','announcements','navigation_items','promo_slides','banners','campaigns','homepage_sections','site_settings','reviews','offers']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s', t);
    execute format('create policy "public read %1$s" on public.%1$s for select using (true)', t);
  end loop;
end $$;

-- Reviews: only approved visible to the storefront.
drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews for select using (status = 'approved');

-- Analytics: anyone can insert events, nobody can read (service role bypasses RLS).
drop policy if exists "anyone insert analytics" on public.analytics_events;
create policy "anyone insert analytics" on public.analytics_events for insert with check (true);

-- ============================================================
-- GRANTS
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select on public.categories, public.editions, public.products, public.product_variants,
  public.collections, public.announcements, public.navigation_items, public.promo_slides,
  public.banners, public.campaigns, public.homepage_sections, public.site_settings, public.reviews, public.offers
  to anon, authenticated;

grant insert on public.analytics_events to anon, authenticated;

grant all on public.products, public.product_variants, public.categories, public.editions,
  public.collections, public.announcements, public.navigation_items, public.promo_slides,
  public.banners, public.campaigns, public.homepage_sections, public.site_settings, public.reviews,
  public.admin_users, public.orders, public.media_assets, public.coupons, public.analytics_events, public.offers
  to service_role;