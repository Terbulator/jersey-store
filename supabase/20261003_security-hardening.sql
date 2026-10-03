-- ============================================================================
-- HEADERR — security hardening migration
-- File: supabase/20261003_security-hardening.sql
-- Safe to run more than once (idempotent). Additive only: no table is dropped,
-- truncated or recreated, and no existing column is removed.
--
-- Fixes, in order:
--   1. orders.tracking_token backfill + unique index (guest tracking secret)
--   2. reviews: drop the overly broad "public read" policy that exposed every
--      review row (including pending/rejected) and customer_email to the anon key
--   3. increment_coupon_usage: revoke EXECUTE from anon/authenticated so the
--      security-definer function cannot be called directly through PostgREST
--   4. redeem_coupon + reserve_order_stock / release_order_stock: atomic,
--      service-role-only helpers used by checkout
--   5. analytics_events: constrain the public INSERT policy to known event names
--   6. orders.coupon_id: the column checkout inserts on every order, missing here
-- ============================================================================

-- Run the whole file in one transaction so a failure part-way through cannot leave
-- the database half-migrated. Every statement is independently idempotent, so a
-- re-run after an aborted attempt is still safe.
begin;

-- `pgcrypto` is installed into the `extensions` schema on Supabase, not `public`.
-- The backfill below calls `digest()`, and Postgres resolves that expression at plan
-- time, so a runner that sets `search_path = public` would abort this whole
-- migration on a missing function -- even when `orders` is empty and the statement
-- matches no rows. Pinning the path first makes the migration resolve identically no
-- matter how it is applied. A schema listed here that does not exist is ignored by
-- Postgres, so this stays portable to a self-hosted `public`-only install.
set search_path = public, extensions;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. orders.tracking_token
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'tracking_token'
  ) then
    alter table public.orders add column tracking_token text;
    raise notice 'Added orders.tracking_token';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'idempotency_key'
  ) then
    alter table public.orders add column idempotency_key text;
    raise notice 'Added orders.idempotency_key';
  end if;

  -- Checkout writes `coupon_id` on every insert, whether or not a coupon was used
  -- (it sends the key with a null value), so a missing column makes *every* order
  -- insert fail with 42703 rather than only coupon orders. storefront.sql and
  -- orders-migration.sql both declare it; production had never received it.
  -- Same definition as orders-migration.sql: nullable, and deleting a coupon leaves
  -- the historical order intact rather than cascading the delete.
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'coupon_id'
  ) then
    alter table public.orders
      add column coupon_id uuid references public.coupons(id) on delete set null;
    raise notice 'Added orders.coupon_id';
  end if;
end $$;

-- Backfill a digest for every order that has none.
--
-- The application stores SHA-256(token) in this column and hands the raw token to
-- the customer at checkout. Pre-existing orders predate tracking tokens, so no
-- customer ever received a raw token for them; storing the digest of a fresh random
-- value gives each legacy row a well-formed, unique, unguessable credential without
-- inventing a secret that anybody holds. (They remain trackable by their owner via
-- the authenticated path.)
update public.orders
set tracking_token = encode(digest(gen_random_uuid()::text || clock_timestamp()::text, 'sha256'), 'hex')
where tracking_token is null;

-- Same for idempotency_key so the dedup index has no unbounded NULL holes.
update public.orders
set idempotency_key = 'legacy-' || id::text
where idempotency_key is null;

-- Unique index for the tracking lookup. `unique` alone permits unlimited NULLs,
-- which is fine now that the backfill leaves none, but an explicit partial unique
-- index is what guarantees token uniqueness going forward.
create unique index if not exists orders_tracking_token_key
  on public.orders (tracking_token)
  where tracking_token is not null;

create unique index if not exists orders_idempotency_key_key
  on public.orders (idempotency_key)
  where idempotency_key is not null;

create index if not exists idx_orders_tracking_token on public.orders (tracking_token);

create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_created on public.orders (created_at);
create index if not exists idx_orders_status on public.orders (status);

alter table public.orders enable row level security;

-- Orders stay service-role only: no anon/authenticated SELECT policy exists, and
-- the grant below is revoked so RLS is not the only thing standing in the way.
drop policy if exists "block anon orders" on public.orders;
create policy "block anon orders" on public.orders for select using (false);

revoke select, insert, update, delete on public.orders from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. reviews — remove the unrestricted public read
-- ---------------------------------------------------------------------------

-- storefront.sql creates "public read reviews" with `using (true)` in its loop AND a
-- second policy with `using (status = 'approved')`. Permissive policies are OR'd,
-- so `using (true)` won and every review row — including customer_email and
-- unmoderated submissions — was readable with the public anon key.
drop policy if exists "public read reviews" on public.reviews;

drop policy if exists "approved reviews are public" on public.reviews;
create policy "approved reviews are public"
  on public.reviews
  for select
  using (status = 'approved');

-- Public reads of reviews must never carry the submitter's email address.
revoke select on public.reviews from anon, authenticated;
-- `status` must be granted as well as the projected columns: PostgreSQL requires
-- SELECT privilege on any column a query references, including one used only in a
-- WHERE clause. The storefront still sends `.eq('status', 'approved')` as
-- defence-in-depth behind the RLS policy, and without the column grant that filter
-- raises `permission denied for table reviews` and blanks the reviews section.
grant select (id, product_id, product_name, product_variant, customer_name, rating,
              title, body, verified_buyer, featured, photo_url, created_at, status)
  on public.reviews to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. increment_coupon_usage — stop anon from calling the definer function
-- ---------------------------------------------------------------------------

-- `security definer` functions are EXECUTE-able by PUBLIC by default, and PostgREST
-- exposes them under /rest/v1/rpc/*. Without these revokes any anonymous client
-- could burn a coupon's entire usage limit, or inflate used_count to disable it.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'increment_coupon_usage') then
    execute 'revoke all on function public.increment_coupon_usage(uuid) from public';
    execute 'revoke all on function public.increment_coupon_usage(uuid) from anon, authenticated';
    execute 'grant execute on function public.increment_coupon_usage(uuid) to service_role';
    raise notice 'Locked down increment_coupon_usage';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Atomic checkout helpers
-- ---------------------------------------------------------------------------

-- Validates AND redeems a coupon in one statement under a row lock, and returns the
-- discount the server authorises. Checkout never trusts a client-supplied amount.
create or replace function public.redeem_coupon(p_coupon_id uuid, p_subtotal numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coupons%rowtype;
  discount numeric := 0;
  safe_subtotal numeric;
  cap numeric;
begin
  safe_subtotal := greatest(0, coalesce(p_subtotal, 0));

  -- Lock the row for the duration of the check so two concurrent checkouts cannot
  -- both observe used_count < max_uses.
  select * into c from public.coupons where id = p_coupon_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Invalid coupon code.');
  end if;
  if not coalesce(c.active, false) then
    return jsonb_build_object('ok', false, 'message', 'Coupon is not active.');
  end if;
  if c.valid_from is not null and c.valid_from > now() then
    return jsonb_build_object('ok', false, 'message', 'Coupon is not active yet.');
  end if;
  if c.valid_until is not null and c.valid_until < now() then
    return jsonb_build_object('ok', false, 'message', 'Coupon has expired.');
  end if;
  if c.max_uses is not null and coalesce(c.used_count, 0) >= c.max_uses then
    return jsonb_build_object('ok', false, 'message', 'Coupon usage limit reached.');
  end if;
  if c.min_spend is not null and safe_subtotal < c.min_spend then
    return jsonb_build_object('ok', false, 'message', 'Minimum spend not met.');
  end if;

  cap := c.max_discount;

  if c.type = 'percent' then
    -- greatest/least clamp the rate so a misconfigured >100% coupon cannot inflate
    -- the discount, and the discount can never exceed the subtotal.
    discount := round(safe_subtotal * (least(greatest(coalesce(c.value, 0), 0), 100) / 100), 2);
    if cap is not null then
      discount := least(discount, cap);
    end if;
  elsif c.type = 'fixed' then
    discount := least(greatest(coalesce(c.value, 0), 0), safe_subtotal);
    if cap is not null then
      discount := least(discount, cap);
    end if;
  else
    return jsonb_build_object('ok', false, 'message', 'Unsupported coupon type.');
  end if;

  discount := round(least(greatest(discount, 0), safe_subtotal), 2);

  update public.coupons
  set used_count = coalesce(used_count, 0) + 1,
      updated_at = now()
  where id = p_coupon_id;

  return jsonb_build_object(
    'ok', true,
    'discount', discount,
    'used_count', coalesce(c.used_count, 0) + 1
  );
end;
$$;

-- Atomically decrements stock for every order line or rolls the whole thing back.
-- `for update` locks each variant row, so two concurrent checkouts for the last unit
-- cannot both succeed.
create or replace function public.reserve_order_stock(p_lines jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  line jsonb;
  v_id uuid;
  v_size text;
  v_qty integer;
  v_stock integer;
  v_product uuid;
begin
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    return jsonb_build_object('ok', false, 'message', 'No items to reserve.');
  end if;

  for line in select * from jsonb_array_elements(p_lines)
  loop
    v_product := nullif(line ->> 'product_id', '')::uuid;
    v_size := line ->> 'size';
    v_qty := (line ->> 'quantity')::integer;

    if v_product is null or v_size is null or v_qty is null or v_qty < 1 then
      return jsonb_build_object('ok', false, 'message', 'Invalid order line.');
    end if;

    select id, stock into v_id, v_stock
    from public.product_variants
    where product_id = v_product and size = v_size
    for update;

    if v_id is null then
      return jsonb_build_object('ok', false, 'message', 'A selected size is unavailable.');
    end if;
    if coalesce(v_stock, 0) < v_qty then
      return jsonb_build_object(
        'ok', false,
        'message', format('Only %s left in size %s.', coalesce(v_stock, 0), v_size)
      );
    end if;

    update public.product_variants
    set stock = stock - v_qty,
        updated_at = now()
    where id = v_id;
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

-- Returns reserved stock when an order is voided after reservation (for example a
-- coupon that filled up mid-checkout).
create or replace function public.release_order_stock(p_lines jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  line jsonb;
begin
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    return jsonb_build_object('ok', false);
  end if;

  for line in select * from jsonb_array_elements(p_lines)
  loop
    update public.product_variants v
    set stock = v.stock + coalesce((line ->> 'quantity')::integer, 0),
        updated_at = now()
    where v.product_id = nullif(line ->> 'product_id', '')::uuid
      and v.size = line ->> 'size';
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

-- These helpers are service-role only. Explicitly revoke the default PUBLIC grant,
-- otherwise anon could call reserve_order_stock directly and drain inventory.
revoke all on function public.redeem_coupon(uuid, numeric) from public;
revoke all on function public.redeem_coupon(uuid, numeric) from anon, authenticated;
grant execute on function public.redeem_coupon(uuid, numeric) to service_role;

revoke all on function public.reserve_order_stock(jsonb) from public;
revoke all on function public.reserve_order_stock(jsonb) from anon, authenticated;
grant execute on function public.reserve_order_stock(jsonb) to service_role;

revoke all on function public.release_order_stock(jsonb) from public;
revoke all on function public.release_order_stock(jsonb) from anon, authenticated;
grant execute on function public.release_order_stock(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 5. analytics_events — bound the public INSERT policy
-- ---------------------------------------------------------------------------

-- The browser telemetry helper writes with the anon key, so INSERT must stay open.
-- It was `with check (true)`, which let anyone insert arbitrary event names, an
-- arbitrary user_id (forging another user's activity) and unbounded strings.
drop policy if exists "anyone insert analytics" on public.analytics_events;
create policy "anyone insert analytics"
  on public.analytics_events
  for insert
  with check (
    event in ('page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'begin_checkout', 'purchase')
    and length(coalesce(product_name, '')) <= 200
    and length(coalesce(category, '')) <= 100
    and length(coalesce(page_url, '')) <= 2000
    and length(coalesce(referrer, '')) <= 2000
    and length(coalesce(device, '')) <= 300
    and (price is null or (price >= 0 and price <= 10000000))
  );

-- ---------------------------------------------------------------------------
-- 6. Remaining private tables stay private
-- ---------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.media_assets enable row level security;
alter table public.coupons enable row level security;
alter table public.analytics_events enable row level security;
alter table public.homepage_sections enable row level security;

drop policy if exists "block anon admin_users" on public.admin_users;
create policy "block anon admin_users" on public.admin_users for select using (false);

drop policy if exists "block anon media_assets" on public.media_assets;
create policy "block anon media_assets" on public.media_assets for select using (false);

drop policy if exists "block anon coupons" on public.coupons;
create policy "block anon coupons" on public.coupons for select using (false);

drop policy if exists "block anon analytics_events" on public.analytics_events;
create policy "block anon analytics_events" on public.analytics_events for select using (false);

-- homepage_sections carries draft columns. The only public path is the
-- get_published_homepage_sections() RPC, which returns published rows explicitly.
revoke select on public.homepage_sections from anon, authenticated;

revoke select on public.admin_users, public.media_assets, public.coupons, public.analytics_events
  from anon, authenticated;

-- service_role keeps full access to every table (it bypasses RLS anyway).
grant all on public.orders, public.admin_users, public.media_assets, public.coupons,
  public.analytics_events, public.reviews, public.products, public.product_variants,
  public.site_settings, public.homepage_sections
  to service_role;

-- `raise` is plpgsql-only, so the completion notice has to live inside a DO block.
do $$
begin
  raise notice 'HEADERR security hardening migration completed.';
end $$;

commit;