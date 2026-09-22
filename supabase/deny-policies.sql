-- Deny-policy hardening: explicitly block anon/authenticated from private tables
-- regardless of default grants. service_role bypasses RLS so admin reads still work.

drop policy if exists "block anon admin_users" on public.admin_users;
create policy "block anon admin_users" on public.admin_users for select using (false);

drop policy if exists "block anon orders" on public.orders;
create policy "block anon orders" on public.orders for select using (false);

drop policy if exists "block anon media_assets" on public.media_assets;
create policy "block anon media_assets" on public.media_assets for select using (false);

drop policy if exists "block anon coupons" on public.coupons;
create policy "block anon coupons" on public.coupons for select using (false);

drop policy if exists "block anon analytics_events" on public.analytics_events;
create policy "block anon analytics_events" on public.analytics_events for select using (false);

revoke select on public.admin_users, public.orders, public.media_assets, public.coupons, public.analytics_events from anon, authenticated;