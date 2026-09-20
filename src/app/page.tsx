import { Hero } from '@/components/website/hero/hero';
import { FeaturedDrop } from '@/components/website/hero/featured-drop';
import { CategoryTile } from '@/components/website/categories/category-tile';
import { ProductCarousel } from '@/components/website/shared/product-carousel';
import { NewArrivalsSection, BestSellersSection } from '@/components/website/shared/product-sections';
import { BrandStory } from '@/components/website/shared/brand-story';
import { ReviewSection } from '@/components/website/shared/review-section';
import { InstagramSection } from '@/components/website/shared/instagram-section';
import { TrustSection } from '@/components/website/shared/trust-section';
import { NewsletterSection } from '@/components/website/shared/newsletter-section';
import { CATEGORIES, PRODUCTS } from '@/data/products';
import { ROUTES } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const footballProducts = PRODUCTS.filter((p) => p.category === 'football').map((p) => p.id);
  const cricketProducts = PRODUCTS.filter((p) => p.category === 'cricket').map((p) => p.id);
  const streetwearProducts = PRODUCTS.filter((p) => p.category === 'streetwear').map((p) => p.id);

  return (
    <>
      {/* 1. Hero — full viewport, image-dominant */}
      <Hero />

      {/* 2. Featured Drop — editorial campaign */}
      <FeaturedDrop />

      {/* 3. Category Navigation — editorial tiles */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
            Explore
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            SHOP BY CULTURE
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <CategoryTile
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              image={cat.image}
              label={cat.label}
              description={cat.description}
            />
          ))}
        </div>
      </section>

      {/* 4. New Drop — product carousel */}
      <ProductCarousel
        title="NEW DROP"
        subtitle="Just Arrived"
        ctaLabel="View All"
        ctaHref="/shop"
        productIds={PRODUCTS.filter((p) => p.badge === 'NEW' || p.badge === 'LIMITED').map((p) => p.id)}
      />

      {/* 5. Editorial Campaign — football culture */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="aspect-[4/5] overflow-hidden order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=800&q=85"
              alt="Football culture"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2 lg:pl-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-3 font-medium">
              Football Culture
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              MORE THAN
              <br />
              A JERSEY.
            </h2>
            <p className="text-sm text-chrome mt-5 max-w-md leading-relaxed">
              From the pitch to the pavement. HEADERR football jerseys are built for people who
              live the game — not just watch it. Premium materials, official badges, culture-first design.
            </p>
            <a
              href={ROUTES.FOOTBALL}
              className="inline-flex items-center gap-2 mt-8 text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal border-b border-charcoal/20 pb-1 hover:text-blood-red hover:border-blood-red/40 transition-all duration-300"
            >
              Shop Football
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Football Collection */}
      <ProductCarousel
        title="FOOTBALL"
        subtitle="The Beautiful Game"
        ctaLabel="Shop Football"
        ctaHref="/football"
        productIds={footballProducts}
      />

      {/* 7. Cricket Collection */}
      <ProductCarousel
        title="CRICKET"
        subtitle="The Gentleman's Game"
        ctaLabel="Shop Cricket"
        ctaHref="/cricket"
        productIds={cricketProducts}
      />

      {/* 8. Streetwear */}
      <ProductCarousel
        title="STREETWEAR"
        subtitle="The Everyday"
        ctaLabel="Shop Streetwear"
        ctaHref="/streetwear"
        productIds={streetwearProducts}
      />

      {/* 9. Brand Statement — large typography */}
      <section className="py-24 sm:py-36 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <div className="max-w-4xl">
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">
            HEADERR Statement
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
            THE GAME
            <br />
            DOESN&rsquo;T END
            <br />
            AT 90&rsquo;.
          </h2>
          <p className="text-sm sm:text-base text-chrome mt-6 sm:mt-8 max-w-lg leading-relaxed">
            Football is 90 minutes. Culture is forever. HEADERR exists at the
            intersection of sport, fashion, and identity. We make what you wear
            after the final whistle.
          </p>
        </div>
      </section>

      {/* 10. Bestsellers */}
      <BestSellersSection />

      {/* 11. Brand Story */}
      <BrandStory />

      {/* 12. Reviews — community voice */}
      <ReviewSection />

      {/* 13. Community / UGC Gallery — editorial grid */}
      <InstagramSection />

      {/* 14. Trust */}
      <TrustSection />

      {/* 15. Newsletter */}
      <NewsletterSection />
    </>
  );
}
