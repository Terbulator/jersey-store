-- ============================================================
-- HEADERR Site Settings RLS — Public vs Private key separation
-- Ensures anon/authenticated can only read public settings,
-- while private (admin) settings require service_role.
-- Idempotent and safe for production databases.
-- ============================================================

-- Drop existing policy if present
drop policy if exists "public read site_settings" on public.site_settings;

-- Public keys readable by anon/authenticated:
--   'shipping' — free shipping threshold, standard rate (checkout needs this)
--   'contact' — contact information (contact page needs this)
--   'site' — site name, description, branding (header/footers need this)
-- All other keys (theme, header, footer, templates, etc.) are PRIVATE
-- and require the service_role key to read due to RLS.
create policy "public read site_settings" on public.site_settings
  for select using (
    key in ('shipping', 'contact', 'site')
  );