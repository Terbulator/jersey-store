-- =============================================================================
-- HEADERR — Cart & Wishlist persistence for signed-in users
-- =============================================================================
-- Apply this file in the Supabase SQL editor (or psql) BEFORE setting
-- NEXT_PUBLIC_SUPABASE_PERSISTENCE="true" in the app environment.
--
-- These are Supabase-postgres tables (auth.users backed). The sync layer reads
-- and writes them from the browser with the anon key, so every table needs RLS.
--
-- product_id and size are plain text matching the storefront catalog
-- (src/data/products.ts), e.g. product_id='p1', size='M'.
-- =============================================================================

-- Wishlist — one row per saved product.
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- Cart header — one row per user.
create table if not exists public.cart (
  user_id uuid primary key references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now()
);

-- Cart lines — one row per (user, product, size).
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_user_id uuid not null references public.cart (user_id) on delete cascade,
  product_id text not null,
  size text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_user_id, product_id, size)
);

-- RLS: every table restricted to the authenticated owner.
alter table public.wishlist_items enable row level security;
alter table public.cart enable row level security;
alter table public.cart_items enable row level security;

create policy "own wishlist select" on public.wishlist_items
  for select using (auth.uid() = user_id);
create policy "own wishlist insert" on public.wishlist_items
  for insert with check (auth.uid() = user_id);
create policy "own wishlist update" on public.wishlist_items
  for update using (auth.uid() = user_id);
create policy "own wishlist delete" on public.wishlist_items
  for delete using (auth.uid() = user_id);

create policy "own cart select" on public.cart
  for select using (auth.uid() = user_id);
create policy "own cart insert" on public.cart
  for insert with check (auth.uid() = user_id);
create policy "own cart update" on public.cart
  for update using (auth.uid() = user_id);

create policy "own cart_items select" on public.cart_items
  for select using (auth.uid() = cart_user_id);
create policy "own cart_items insert" on public.cart_items
  for insert with check (auth.uid() = cart_user_id);
create policy "own cart_items update" on public.cart_items
  for update using (auth.uid() = cart_user_id);
create policy "own cart_items delete" on public.cart_items
  for delete using (auth.uid() = cart_user_id);