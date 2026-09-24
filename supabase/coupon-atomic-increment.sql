-- =============================================================================
-- HEADERR — Atomic coupon usage increment
-- Prevents concurrent checkouts from exceeding the coupon's max_uses limit.
-- Uses a single atomic UPDATE ... RETURNING ... to safely increment and check.
-- Must be called via the RPC: public.increment_coupon_usage(coupon_id)
-- SECURITY DEFINER: explicitly sets search_path to prevent object hijacking.
-- =============================================================================

create or replace function public.increment_coupon_usage(coupon_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows int;
  new_used_count int;
  coupon_max_uses int;
  result jsonb;
begin
  -- Atomically increment used_count and return the new value.
  -- The WHERE clause ensures we only count toward the limit.
  update public.coupons
  set used_count = public.coupons.used_count + 1,
      updated_at = now()
  where id = coupon_id
  and used_count < (select max_uses from public.coupons where id = coupon_id);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  -- Read back the current used_count and max_uses for the response.
  select used_count, max_uses
  into new_used_count, coupon_max_uses
  from public.coupons
  where id = coupon_id;

  -- Build result for the caller
  result = jsonb_build_object(
    'success', updated_rows > 0,
    'used_count', COALESCE(new_used_count, 0),
    'max_uses', COALESCE(coupon_max_uses, 0),
    'remaining', GREATEST(0, COALESCE(coupon_max_uses, 0) - COALESCE(new_used_count, 0))
  );

  return result;
end;
$$;