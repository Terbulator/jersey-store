'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FootballCampaign } from '@/components/website/campaigns/football-campaign';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/website/product/product-card';
import { productGridStagger } from '@/components/motion/motion-variants';
import { ROUTES } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { fadeUpSmall, clipReveal, EASE_PREMIUM } from '@/components/motion/motion-variants';

const footballProducts = PRODUCTS.filter((p) => p.category === 'football');

function FootballPageContent() {
  const searchParams = useSearchParams();
  const edition = searchParams.get('edition');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');

  let filteredProducts = footballProducts;

  if (edition) {
    filteredProducts = filteredProducts.filter((p) => p.edition === edition);
  }
  if (category) {
    filteredProducts = filteredProducts.filter((p) => {
      if (category === 'club') return p.team !== 'Brazil' && p.team !== 'Argentina' && p.team !== 'France';
      if (category === 'national') return ['Brazil', 'Argentina', 'France'].includes(p.team);
      if (category === 'world-cup') return p.season === '2026';
      return true;
    });
  }
  if (sort === 'newest') {
    filteredProducts = filteredProducts.filter((p) => p.badge === 'NEW').sort(() => Math.random() - 0.5);
  } else if (sort === 'best-selling') {
    filteredProducts = filteredProducts.filter((p) => p.badge === 'SALE').sort(() => Math.random() - 0.5);
  } else if (sort === 'limited') {
    filteredProducts = filteredProducts.filter((p) => p.badge === 'LIMITED').sort(() => Math.random() - 0.5);
  }

  const { ref, isVisible } = useScrollReveal({ rootMargin: '-100px' });

  return (
    <>
      {/* Football Campaign Hero */}
      <FootballCampaign />

      {/* Collection Header */}
      <section ref={ref} className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-navy">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="text-[10px] tracking-[0.2em] uppercase text-gold mb-4 font-medium"
          >
            Football Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }}
            animate={isVisible ? { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' } : { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE_PREMIUM }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95] uppercase"
          >
            CLUBS & NATIONALS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE_PREMIUM }}
            className="text-base sm:text-lg text-sage mt-4 max-w-lg leading-relaxed"
          >
            Player Version, Master Edition & Special Edition kits from the world&apos;s biggest clubs
            and national teams. The 2026 World Cup cycle starts now.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.4, duration: 0.6, ease: EASE_PREMIUM }}
            className="mt-8 flex flex-wrap gap-3 text-[10px] tracking-[0.15em] uppercase text-gold/70"
          >
            <span>PLAYER VERSION</span>
            <span className="text-olive/50">·</span>
            <span>MASTER EDITION</span>
            <span className="text-olive/50">·</span>
            <span>LIMITED DROPS</span>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto border-t border-olive/10 bg-deep-blue/50">
        <div className="flex flex-wrap items-center gap-4 text-[11px] tracking-[0.15em] uppercase">
          <span className="text-sage/50">FILTER:</span>
          <Link
            href={ROUTES.FOOTBALL}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              !edition && !category && !sort ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            All
          </Link>
          <Link
            href={`${ROUTES.FOOTBALL}?edition=player`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              edition === 'player' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Player Version
          </Link>
          <Link
            href={`${ROUTES.FOOTBALL}?edition=master`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              edition === 'master' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Master Edition
          </Link>
          <Link
            href={`${ROUTES.FOOTBALL}?category=club`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              category === 'club' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Clubs
          </Link>
          <Link
            href={`${ROUTES.FOOTBALL}?category=national`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              category === 'national' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Nationals
          </Link>
          <Link
            href={`${ROUTES.FOOTBALL}?sort=newest`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              sort === 'newest' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            New Arrivals
          </Link>
          <Link
            href={`${ROUTES.FOOTBALL}?sort=best-selling`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              sort === 'best-selling' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Best Sellers
          </Link>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-navy">
        <motion.div
          variants={productGridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="product-grid"
        >
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              custom={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sage">No products match your filters.</p>
          </div>
        )}
      </section>
    </>
  );
}

export default function FootballPage() {
  return (
    <Suspense fallback={<div className="py-8" />}>
      <FootballPageContent />
    </Suspense>
  );
}