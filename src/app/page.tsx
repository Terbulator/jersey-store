import { Hero } from '@/components/website/hero/hero';
import { ShopByCulture } from '@/components/website/promo/shop-by-culture';
import { TaglineStrip } from '@/components/website/promo/tagline-strip';
import { TeamCarousel } from '@/components/website/promo/team-carousel';
import { NewArrivalsSection, BestSellersSection } from '@/components/website/shared/product-sections';
import { SecondaryPromoRow } from '@/components/website/promo/secondary-promo-row';
import { EditorialTeaser } from '@/components/website/promo/editorial-teaser';
import { StatementSection } from '@/components/website/promo/statement-section';
import { NewsletterSection } from '@/components/website/shared/newsletter-section';
import { Footer } from '@/components/website/footer/footer';
import { PRODUCTS } from '@/data/products';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — full-bleed campaign image, minimal copy, one CTA */}
      <Hero />

      {/* 2. 3-card promo row — Football / Cricket / Streetwear (uses PromoCard) */}
      <ShopByCulture />

      {/* 3. Tagline strip — thin, centered, text-only */}
      <TaglineStrip />

      {/* 4. "Shop by Team" horizontal carousel — one card per team in catalog */}
      <TeamCarousel />

      {/* 5. New Arrivals — denser commerce grid */}
      <NewArrivalsSection />

      {/* 6. Secondary promo row (2-up) — Player Edition vs Master Edition */}
      <SecondaryPromoRow />

      {/* 7. Editorial/culture teaser cards (2 cards) */}
      <EditorialTeaser
        cards={[
          {
            image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&q=85',
            imageAlt: 'HEADERR editorial campaign',
            eyebrow: 'CAMPAIGN',
            title: 'WORLD FOOTBALL 2026',
            subtitle: 'The campaign film. Shot across three continents. Featuring the Player Version Brazil, Argentina, and France kits.',
            href: '/culture#editorials',
            ctaLabel: 'Watch Film',
          },
          {
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
            imageAlt: 'HEADERR IRL community',
            eyebrow: 'HEADERR IRL',
            title: 'REAL PEOPLE, REAL STORIES',
            subtitle: 'From Mumbai streets to Manchester stands. Community members wearing the culture every day.',
            href: '/culture#irl',
            ctaLabel: 'Read Stories',
          },
        ]}
      />

      {/* 8. Manifesto/statement section — full-width bg image with statement overlay */}
      <StatementSection />

      {/* 9. Newsletter — minimal treatment */}
      <NewsletterSection />

      {/* 10. Footer — calmer spacing and type scale */}
      <Footer />
    </>
  );
}