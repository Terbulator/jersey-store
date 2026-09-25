-- ============================================================
-- HEADERR Homepage Published Sections RPC
-- Sole public path to homepage_sections content.
-- ============================================================

revoke select on public.homepage_sections from anon, authenticated;

create or replace function public.get_published_homepage_sections()
returns table (id uuid, key text, name text, enabled boolean, sort_order int, settings jsonb)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.key, s.name, s.enabled, s.sort_order, s.settings
  from public.homepage_sections s
  where s.enabled = true
  order by s.sort_order
$$;

grant execute on function public.get_published_homepage_sections() to anon, authenticated;
