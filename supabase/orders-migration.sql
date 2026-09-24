-- ============================================================
-- HEADERR Orders Migration — Safe forward-only migration
-- Adds required columns and indexes if they do not already exist.
-- Idempotent: safe to run multiple times on the same database.
-- Never drops, truncates, or recreates the orders table.
-- ============================================================

-- Add tracking_token column if not exists (UUID-like string, unique)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'tracking_token') then
    alter table public.orders add column tracking_token text unique;
    raise notice 'Added tracking_token column to public.orders';
  else
    raise notice 'tracking_token column already exists in public.orders — skipping.';
  end if;
end $$;

-- Add idempotency_key column if not exists (unique string for dedup)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'idempotency_key') then
    alter table public.orders add column idempotency_key text unique;
    raise notice 'Added idempotency_key column to public.orders';
  else
    raise notice 'idempotency_key column already exists in public.orders — skipping.';
  end if;
end $$;

-- Add coupon_id column if not exists (FK to coupons)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'coupon_id') then
    alter table public.orders add column coupon_id uuid references public.coupons(id) on delete set null;
    raise notice 'Added coupon_id column to public.orders';
  else
    raise notice 'coupon_id column already exists in public.orders — skipping.';
  end if;
end $$;

-- Ensure idx_orders_tracking_token index exists
do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_orders_tracking_token') then
    create index idx_orders_tracking_token on public.orders(tracking_token);
    raise notice 'Created idx_orders_tracking_token index';
  else
    raise notice 'idx_orders_tracking_token index already exists — skipping.';
  end if;
end $$;

-- Ensure idx_orders_idempotency_key index exists
do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_orders_idempotency_key') then
    create index idx_orders_idempotency_key on public.orders(idempotency_key);
    raise notice 'Created idx_orders_idempotency_key index';
  else
    raise notice 'idx_orders_idempotency_key index already exists — skipping.';
  end if;
end $$;

-- Ensure idx_orders_user_id index exists
do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_orders_user_id') then
    create index idx_orders_user_id on public.orders(user_id);
    raise notice 'Created idx_orders_user_id index';
  else
    raise notice 'idx_orders_user_id index already exists — skipping.';
  end if;
end $$;

raise notice 'Orders migration completed successfully.';