'use client';

import { useState, useMemo } from 'react';
import { Monitor, Tablet, Smartphone, Eye } from 'lucide-react';
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

interface PreviewPanelProps {
  settingsMap: Record<string, Record<string, unknown> | null>;
  products: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  editions: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  selectedKey: string | null;
  editorSettings: Record<string, Record<string, unknown> | null>;
  onSelect: (key: string) => void;
  inspectorMode: boolean;
}

const SECTION_KEYS = ['hero', 'story_slides', 'trust_strip', 'category_nav', 'best_sellers', 'editorial_split', 'bundle_section', 'stats_section', 'editions_section', 'expert_section', 'newsletter_section', 'review_section'];

const SECTION_NAMES: Record<string, string> = {
  hero: 'Hero', story_slides: 'Story Slides', trust_strip: 'Trust Strip', category_nav: 'Category Nav',
  best_sellers: 'Best Sellers', editorial_split: 'Editorial Split', bundle_section: 'Bundle',
  stats_section: 'Stats', editions_section: 'Editions', expert_section: 'Expert',
  newsletter_section: 'Newsletter', review_section: 'Reviews',
};

export function PreviewPanel({ settingsMap, products, categories, editions, reviews, selectedKey, editorSettings, onSelect, inspectorMode }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const merged = useMemo(() => ({ ...settingsMap, ...editorSettings }), [settingsMap, editorSettings]);

  const vpW = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px';

  function renderContent(key: string, settings: Record<string, unknown> | null) {
    switch (key) {
      case 'hero': return <SiteHero settings={settings as any} />;
      case 'story_slides': return <StorySlides categories={categories as any} settings={settings as any} />;
      case 'trust_strip': return <TrustStrip settings={settings as any} />;
      case 'category_nav': return <CategoryNav categories={categories as any} settings={settings as any} />;
      case 'best_sellers': return <BestSellers products={products as any} editions={editions as any} settings={settings as any} />;
      case 'editorial_split': return <EditorialSplit settings={settings as any} />;
      case 'bundle_section': return <BundleSection settings={settings as any} />;
      case 'stats_section': return <StatsSection settings={settings as any} />;
      case 'editions_section': return <EditionsSection editions={editions as any} products={products as any} settings={settings as any} />;
      case 'expert_section': return <ExpertSection settings={settings as any} />;
      case 'newsletter_section': return <NewsletterSection settings={settings as any} />;
      case 'review_section': return <ReviewSection reviews={reviews as any} products={products as any} editions={editions as any} settings={settings as any} />;
      default: return null;
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full bg-[#0a0a0a] border-l border-[#292929] overflow-y-auto z-50 shadow-2xl" style={{ width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%' }}>
      <div className="sticky top-0 bg-[#111111] border-b border-[#292929] px-4 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#B3001B]" />
          <span className="font-mono-meta text-[10px] text-[#A8A8A8] uppercase tracking-[0.15em]">Live Preview</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { key: 'desktop' as const, icon: Monitor },
            { key: 'tablet' as const, icon: Tablet },
            { key: 'mobile' as const, icon: Smartphone },
          ].map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setViewport(key)} className={`p-1.5 rounded ${viewport === key ? 'bg-[#B3001B]/20 text-[#B3001B]' : 'text-[#666666] hover:text-[#EFECE6]'}`} aria-label={`${key} view`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto p-4" style={{ maxWidth: vpW }}>
        {SECTION_KEYS.map((key) => {
          const settings = merged[key] ?? null;
          const isHighlighted = selectedKey === key;
          const label = SECTION_NAMES[key] ?? key;
          return (
            <div key={key} onClick={() => onSelect(key)} className={`relative transition-all duration-200 cursor-pointer ${isHighlighted ? 'ring-2 ring-[#B3001B] ring-offset-2' : ''} ${inspectorMode && !selectedKey ? 'hover:ring-2 hover:ring-[#B3001B]/50' : ''}`}>
              {isHighlighted && <span className="absolute -top-6 left-2 text-[9px] font-mono-meta bg-[#B3001B] text-white px-1.5 py-0.5 rounded z-20">{label}</span>}
              {renderContent(key, settings)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
