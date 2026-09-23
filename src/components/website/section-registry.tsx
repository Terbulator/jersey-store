import { Fragment, type ReactNode } from 'react';
import { SectionShell } from '@/components/website/section-shell';
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
  hero: { key: 'hero', label: 'Hero' },
  story_slides: { key: 'story_slides', label: 'Story Slides' },
  trust_strip: { key: 'trust_strip', label: 'Trust Strip' },
  category_nav: { key: 'category_nav', label: 'Category Nav' },
  best_sellers: { key: 'best_sellers', label: 'Best Sellers' },
  editorial_split: { key: 'editorial_split', label: 'Editorial Split' },
  bundle_section: { key: 'bundle_section', label: 'Bundle Section' },
  stats_section: { key: 'stats_section', label: 'Stats' },
  editions_section: { key: 'editions_section', label: 'Editions' },
  expert_section: { key: 'expert_section', label: 'Expert Section' },
  newsletter_section: { key: 'newsletter_section', label: 'Newsletter' },
  review_section: { key: 'review_section', label: 'Reviews' },
};

// Design keys each section supports. bg/padding/radius are excluded where
// they would break full-bleed or sticky layouts (hero, story). Plain data in
// this directive-free module so server components can import it — it must
// NOT live in a 'use client' module (that breaks the production RSC manifest).
export const SECTION_SUPPORT: Record<string, string[]> = {
  hero: ['bg', 'heading_color', 'body_color', 'accent_color', 'align', 'animation', 'visibility'],
  story_slides: ['bg', 'heading_color', 'body_color', 'accent_color', 'visibility'],
  trust_strip: ['bg', 'body_color', 'accent_color', 'padding', 'visibility', 'animation'],
  category_nav: ['bg', 'heading_color', 'accent_color', 'heading_size', 'padding', 'align', 'visibility', 'animation'],
  best_sellers: ['bg', 'heading_color', 'heading_size', 'padding', 'align', 'visibility', 'animation'],
  editorial_split: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  bundle_section: ['bg', 'heading_color', 'body_color', 'accent_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  stats_section: ['bg', 'heading_color', 'body_color', 'padding', 'visibility', 'animation'],
  editions_section: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'visibility', 'animation'],
  expert_section: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  newsletter_section: ['bg', 'heading_color', 'body_color', 'accent_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
  review_section: ['bg', 'heading_color', 'body_color', 'heading_size', 'padding', 'align', 'radius', 'shadow', 'animation', 'visibility'],
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
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.hero}><SiteHero settings={settings as any} /></SectionShell>;
    case 'story_slides':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.story_slides}><StorySlides categories={data.categories} settings={settings as any} /></SectionShell>;
    case 'trust_strip':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.trust_strip}><TrustStrip settings={settings as any} /></SectionShell>;
    case 'category_nav':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.category_nav}><CategoryNav categories={data.categories} settings={settings as any} /></SectionShell>;
    case 'best_sellers':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.best_sellers}><BestSellers products={data.products} editions={data.editions} settings={settings as any} /></SectionShell>;
    case 'editorial_split':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.editorial_split}><EditorialSplit settings={settings as any} /></SectionShell>;
    case 'bundle_section':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.bundle_section}><BundleSection settings={settings as any} /></SectionShell>;
    case 'stats_section':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.stats_section}><StatsSection settings={settings as any} /></SectionShell>;
    case 'editions_section':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.editions_section}><EditionsSection editions={data.editions} products={data.products} settings={settings as any} /></SectionShell>;
    case 'expert_section':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.expert_section}><ExpertSection settings={settings as any} /></SectionShell>;
    case 'newsletter_section':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.newsletter_section}><NewsletterSection settings={settings as any} /></SectionShell>;
    case 'review_section':
      return <SectionShell design={(settings as any)?.design} support={SECTION_SUPPORT.review_section}><ReviewSection reviews={data.reviews} products={data.products} editions={data.editions} settings={settings as any} /></SectionShell>;
    default:
      return null;
  }
}

// Renders the homepage exactly as the storefront does: enabled sections in
// the given order — or every registry section when none are enabled (the
// storefront fallback). The live page and every admin preview call this one
// function, so preview can never drift from production. Unknown keys render
// null via renderSection's default branch. Items may repeat a key
// (duplicated sections); identity comes from id, settings from the item.
export function renderHomepageSections(
  items: { id?: string | null; key: string; enabled: boolean; settings?: Record<string, unknown> | null }[],
  settingsMap: Record<string, Record<string, unknown> | null>,
  data: StorefrontData,
  wrap?: (item: { id?: string | null; key: SectionKey }, node: ReactNode) => ReactNode
) {
  const enabled = items.filter((i) => i.enabled);
  const list: { id?: string | null; key: string; enabled: boolean; settings?: Record<string, unknown> | null }[] =
    enabled.length ? enabled : SECTION_ORDER.map((key) => ({ key, enabled: true }));
  return list.map((item, idx) => {
    const key = item.key as SectionKey;
    const node = renderSection(key, item.settings ?? settingsMap[item.key] ?? null, data);
    return <Fragment key={item.id ?? `${item.key}-${idx}`}>{wrap ? wrap({ id: item.id, key }, node) : node}</Fragment>;
  });
}
