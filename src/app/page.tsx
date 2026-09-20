import Link from 'next/link';
import { Hero } from '@/components/website/hero/hero';
import { FeaturedDrop } from '@/components/website/hero/featured-drop';
import { CategoryTile } from '@/components/website/categories/category-tile';
import { CATEGORIES } from '@/data/products';
import { TrustSection } from '@/components/website/shared/trust-section';
import { BrandStory } from '@/components/website/shared/brand-story';
import { ReviewSection } from '@/components/website/shared/review-section';
import { InstagramSection } from '@/components/website/shared/instagram-section';
import { NewsletterSection } from '@/components/website/shared/newsletter-section';
import { NewArrivalsSection, BestSellersSection } from '@/components/website/shared/product-sections';
import { ProductCarousel } from '@/components/website/shared/product-carousel';
import { PRODUCTS } from '@/data/products';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const featuredProducts = PRODUCTS.filter((p) => p.badge === 'SALE' || p.badge === 'LIMITED').slice(0, 4);

  return (
    <>
      <Hero />
      <FeaturedDrop />

      {/* Shop by Category */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs tracking-widest uppercase text-blood-red text-center mb-10">SHOP BY CATEGORY</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryTile key={cat.id} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Jersey Type Discovery */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs tracking-widest uppercase text-blood-red text-center mb-10">SHOP BY JERSEY TYPE</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Player Version', desc: 'Authentic on-field feel', img: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80' },
              { name: 'Master Edition', desc: 'Premium everyday wear', img: 'https://images.unsplash.com/photo-1598221428011-33ef7e864d49?w=600&q=80' },
              { name: 'Special Edition', desc: 'Limited run releases', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80' },
              { name: 'Custom', desc: 'Name & number', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
            ].map((item) => (
              <Link key={item.name} href="/shop" className="group relative block h-64 sm:h-80 overflow-hidden bg-charcoal">
                <div className="absolute inset-0 img-zoom">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-wider uppercase text-off-white">{item.name}</h3>
                    <p className="text-off-white/60 text-xs tracking-wide mt-1">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Drop Carousel */}
      <ProductCarousel
        title="FEATURED DROP"
        subtitle="Trending Now"
        ctaLabel="VIEW ALL →"
        ctaHref="/shop"
        productIds={featuredProducts.map((p) => p.id)}
      />

      <NewArrivalsSection />
      <BestSellersSection />

      {/* Sport Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-charcoal">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs tracking-widest uppercase text-blood-red text-center mb-10">CULTURE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'FOOTBALL', subtitle: '90 MINUTES. 90 STORIES.', desc: 'The beautiful game.', img: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=800&q=80' },
              { title: 'CRICKET', subtitle: 'BAT. BALL. HEART.', desc: 'The ultimate sport.', img: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=800&q=80' },
              { title: 'STREETWEAR', subtitle: 'THE EVERYDAY.', desc: 'Culture on cloth.', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' },
            ].map((item) => (
              <Link key={item.title} href={`/shop/${item.title.toLowerCase()}`} className="group relative block h-80 overflow-hidden">
                <div className="absolute inset-0 img-zoom">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end p-6 text-center">
                  <h3 className="text-2xl font-bold tracking-wider uppercase text-off-white">{item.title}</h3>
                  <p className="text-off-white/50 text-xs tracking-widest uppercase mt-2">{item.subtitle}</p>
                  <p className="text-off-white/40 text-xs mt-1">{item.desc}</p>
                  <span className="mt-4 text-blood-red text-[10px] tracking-widest uppercase group-hover:underline">EXPLORE →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BrandStory />
      <ReviewSection />
      <InstagramSection />
      <TrustSection />
      <NewsletterSection />
    </>
  );
}