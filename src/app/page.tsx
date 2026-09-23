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
import {
  getProducts,
  getCategories,
  getEditions,
  getApprovedReviews,
} from '@/lib/storefront';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('key, enabled, settings')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  const settingsMap: Record<string, Record<string, unknown> | null> = {};
  for (const s of (data ?? [])) {
    if (s.enabled && s.settings && typeof s.settings === 'object') settingsMap[s.key] = s.settings as Record<string, unknown>;
  }
  function g(k: string): Record<string, unknown> | null { return settingsMap[k] ?? null; }

  const [products, categories, editions, reviews] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
    getApprovedReviews(),
  ]);

  const allSections: { key: string; render: ReactNode }[] = [
    { key: 'hero', render: <SiteHero settings={g('hero') as any} /> },
    { key: 'story_slides', render: <StorySlides categories={categories} settings={g('story_slides') as any} /> },
    { key: 'trust_strip', render: <TrustStrip settings={g('trust_strip') as any} /> },
    { key: 'category_nav', render: <CategoryNav categories={categories} settings={g('category_nav') as any} /> },
    { key: 'best_sellers', render: <BestSellers products={products} editions={editions} settings={g('best_sellers') as any} /> },
    { key: 'editorial_split', render: <EditorialSplit settings={g('editorial_split') as any} /> },
    { key: 'bundle_section', render: <BundleSection settings={g('bundle_section') as any} /> },
    { key: 'stats_section', render: <StatsSection settings={g('stats_section') as any} /> },
    { key: 'editions_section', render: <EditionsSection editions={editions} products={products} settings={g('editions_section') as any} /> },
    { key: 'expert_section', render: <ExpertSection settings={g('expert_section') as any} /> },
    { key: 'newsletter_section', render: <NewsletterSection settings={g('newsletter_section') as any} /> },
    { key: 'review_section', render: <ReviewSection reviews={reviews} products={products} editions={editions} settings={g('review_section') as any} /> },
  ];

  const orderedData = data ?? [];
  const sections = orderedData.length
    ? allSections.filter((s) => orderedData.some((d) => d.key === s.key && d.enabled)).sort(
        (a, b) => orderedData.findIndex((x) => x.key === a.key) - orderedData.findIndex((x) => x.key === b.key)
      )
    : allSections;

  return <>{sections.map((s) => s.render)}</>;
}
