-- ============================================================
-- HEADERR Site Settings RLS -- strict storefront allowlist
-- ============================================================

drop policy if exists "public read site_settings" on public.site_settings;

create policy "public read site_settings" on public.site_settings
  for select using (
    key in ('theme','header','footer','templates','shipping')
  );
