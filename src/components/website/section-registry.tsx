'use client';

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
import type { Product, Category, Edition, Review } from '@/lib/storefront-types';

export interface StorefrontData {
  products: Product[];
  categories: Category[];
  editions: Edition[];
  reviews: Review[];
}

export type SectionKey =
  | 'hero'
  | 'story_slides'
  | 'trust_strip'
  | 'category_nav'
  | 'best_sellers'
  | 'editorial_split'
  | 'bundle_section'
  | 'stats_section'
  | 'editions_section'
  | 'expert_section'
  | 'newsletter_section'
  | 'review_section';

export interface SectionMeta {
  key: SectionKey;
  name: string;
  label: string;
}

// Canonical section order + metadata. Both the storefront page and the admin
// preview render sections through this single registry.
export const SECTION_ORDER: SectionKey[] = [
  'hero',
  'story_slides',
  'trust_strip',
  'category_nav',
  'best_sellers',
  'editorial_split',
  'bundle_section',
  'stats_section',
  'editions_section',
  'expert_section',
  'newsletter_section',
  'review_section',
];

export const SECTION_META: Record<SectionKey, SectionMeta> = {
  hero: { key: 'hero', name: 'Hero', label: 'Hero' },
  story_slides: { key: 'story_slides', name: 'Story Slides', label: 'Story Slides' },
  trust_strip: { key: 'trust_strip', name: 'Trust Strip', label: 'Trust Strip' },
  category_nav: { key: 'category_nav', name: 'Category Nav', label: 'Category Nav' },
  best_sellers: { key: 'best_sellers', name: 'Best Sellers', label: 'Best Sellers' },
  editorial_split: { key: 'editorial_split', name: 'Editorial Split', label: 'Editorial Split' },
  bundle_section: { key: 'bundle_section', name: 'Bundle Section', label: 'Bundle Section' },
  stats_section: { key: 'stats_section', name: 'Stats', label: 'Stats' },
  editions_section: { key: 'editions_section', name: 'Editions', label: 'Editions' },
  expert_section: { key: 'expert_section', name: 'Expert Section', label: 'Expert Section' },
  newsletter_section: { key: 'newsletter_section', name: 'Newsletter', label: 'Newsletter' },
  review_section: { key: 'review_section', name: 'Reviews', label: 'Reviews' },
};

// Renders a single section given its key, settings, and storefront data.
// This is the shared renderer: the customer storefront and the admin live
// preview both call this with the same components.
export function renderSection(
  key: SectionKey,
  settings: Record<string, unknown> | null,
  data: StorefrontData
) {
  switch (key) {
    case 'hero':
      return <SiteHero settings={settings as any} />;
    case 'story_slides':
      return <StorySlides categories={data.categories} settings={settings as any} />;
    case 'trust_strip':
      return <TrustStrip settings={settings as any} />;
    case 'category_nav':
      return <CategoryNav categories={data.categories} settings={settings as any} />;
    case 'best_sellers':
      return <BestSellers products={data.products} editions={data.editions} settings={settings as any} />;
    case 'editorial_split':
      return <EditorialSplit settings={settings as any} />;
    case 'bundle_section':
      return <BundleSection settings={settings as any} />;
    case 'stats_section':
      return <StatsSection settings={settings as any} />;
    case 'editions_section':
      return <EditionsSection editions={data.editions} products={data.products} settings={settings as any} />;
    case 'expert_section':
      return <ExpertSection settings={settings as any} />;
    case 'newsletter_section':
      return <NewsletterSection settings={settings as any} />;
    case 'review_section':
      return <ReviewSection reviews={data.reviews} products={data.products} editions={data.editions} settings={settings as any} />;
    default:
      return null;
  }
}

// Renders every section in the registry (used as the fallback when no
// homepage_sections rows exist).
export function renderAllSections(
  settingsMap: Record<string, Record<string, unknown> | null>,
  data: StorefrontData
) {
  return SECTION_ORDER.map((key) => renderSection(key, settingsMap[key] ?? null, data));
}