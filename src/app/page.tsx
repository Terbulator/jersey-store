import { SiteHero } from '@/components/website/sections/site-hero';
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

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <SiteHero />
      <TrustStrip />
      <CategoryNav />
      <BestSellers />
      <EditorialSplit />
      <BundleSection />
      <StatsSection />
      <EditionsSection />
      <ExpertSection />
      <NewsletterSection />
      <ReviewSection />
    </>
  );
}