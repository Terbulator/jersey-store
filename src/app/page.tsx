import { createClient } from '@/lib/supabase/server';
import { getHomepageRenderData } from '@/lib/homepage';
import { renderHomepageSections } from '@/components/website/section-registry';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Live storefront: published columns only, via the anon-safe RPC —
  // unpublished drafts never leave the database on this path. Admin
  // previews render through the same renderHomepageSections with drafts.
  const { items, settingsMap, storefrontData } = await getHomepageRenderData(createClient(), 'live', { publishedOnly: true });
  return <>{renderHomepageSections(items, settingsMap, storefrontData)}</>;
}