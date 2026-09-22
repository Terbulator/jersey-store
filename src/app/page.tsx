import { SiteHero } from '@/components/website/sections/site-hero';
import { StorySlides } from '@/components/website/sections/story-slides';
import { TrustStrip } from '@/components/website/sections/trust-strip';
import { CategoryNav } from '@/components/website/sections/category-nav';
import { BestSellers } from '@/components/website/sections/best-sellers';
import { EditorialSplit } from '@/components/website/sections/editorial-split';
import { BundleSection } from '@/components/website/sections/bundle-section';
import { StatsSection } from '@/components/website/sections/stats-section';
import { EditionsSection } from '@/components/website/sections/editions-section';
import { ExpertSection } from '@/components/website/sections/expert-section';
import { NewsletterSection } from '@/components/website/sections/newsletter-section';
import { ReviewSection } from '@/components/website/reviews/review-section';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ALL_SECTIONS = [
  { key: 'hero', render: <SiteHero /> },
  { key: 'story_slides', render: <StorySlides /> },
  { key: 'trust_strip', render: <TrustStrip /> },
  { key: 'category_nav', render: <CategoryNav /> },
  { key: 'best_sellers', render: <BestSellers /> },
  { key: 'editorial_split', render: <EditorialSplit /> },
  { key: 'bundle_section', render: <BundleSection /> },
  { key: 'stats_section', render: <StatsSection /> },
  { key: 'editions_section', render: <EditionsSection /> },
  { key: 'expert_section', render: <ExpertSection /> },
  { key: 'newsletter_section', render: <NewsletterSection /> },
  { key: 'review_section', render: <ReviewSection /> },
];

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('key, enabled')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  const enabledKeys = data?.length ? new Set(data.filter((s) => s.enabled).map((s) => s.key)) : null;

  const orderedData = data ?? [];
  // Fallback: DB unavailable or empty → full saved layout.
  const sections = enabledKeys
    ? ALL_SECTIONS.filter((s) => enabledKeys.has(s.key)).sort(
        (a, b) => orderedData.findIndex((x) => x.key === a.key) - orderedData.findIndex((x) => x.key === b.key)
      )
    : ALL_SECTIONS;

  return <>{sections.map((s) => s.render)}</>;
}