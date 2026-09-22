import { Hero } from '@/components/website/hero/hero';
import { CategoryMosaic } from '@/components/website/categories/category-mosaic';
import { FootballCampaign } from '@/components/website/campaigns/football-campaign';
import { CricketCampaign } from '@/components/website/campaigns/cricket-campaign';
import { StreetwearEditorial } from '@/components/website/campaigns/streetwear-editorial';
import { FeaturedDrop } from '@/components/website/hero/featured-drop';
import { CultureStory } from '@/components/website/campaigns/culture-story';
import { NewArrivalsSection } from '@/components/website/shared/product-sections';
import { NewsletterSection } from '@/components/website/shared/newsletter-section';
import { Footer } from '@/components/website/footer/footer';
import { PRODUCTS } from '@/data/products';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — full-width image-led campaign */}
      <Hero />

      {/* 2. Asymmetric Category Discovery */}
      <CategoryMosaic />

      {/* 3. New Arrivals — serious retail merchandising */}
      <NewArrivalsSection />

      {/* 4. Football Campaign */}
      <FootballCampaign />

      {/* 5. Cricket Campaign */}
      <CricketCampaign />

      {/* 6. Streetwear Editorial */}
      <StreetwearEditorial />

      {/* 7. Featured Drop */}
      <FeaturedDrop />

      {/* 8. Culture Story */}
      <CultureStory />

      {/* 9. Newsletter */}
      <NewsletterSection />

      {/* 10. Footer */}
      <Footer />
    </>
  );
}