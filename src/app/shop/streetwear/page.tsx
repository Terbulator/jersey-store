'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { StreetwearEditorial } from '@/components/website/campaigns/streetwear-editorial';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/website/product/product-card';
import { productGridStagger } from '@/components/motion/motion-variants';
import { ROUTES } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { fadeUpSmall, clipReveal, EASE_PREMIUM } from '@/components/motion/motion-variants';

const streetwearProducts = PRODUCTS.filter((p) => p.category === 'streetwear');

function StreetwearPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');

  let filteredProducts = streetwearProducts;

  if (category) {
    filteredProducts = filteredProducts.filter((p) => {
      if (category === 'tees') return p.name.toLowerCase().includes('tee');
      if (category === 'hoodies') return p.name.toLowerCase().includes('hoodie');
      if (category === 'sweatshirts') return p.name.toLowerCase().includes('sweatshirt');
      if (category === 'oversized') return p.fit === 'Oversized';
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
      {/* Streetwear Editorial Hero */}
      <StreetwearEditorial />

      {/* Collection Header */}
      <section ref={ref} className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-olive">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="text-[10px] tracking-[0.2em] uppercase text-gold mb-4 font-medium"
          >
            Streetwear Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }}
            animate={isVisible ? { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' } : { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE_PREMIUM }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95] uppercase"
          >
            WEAR THE CULTURE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE_PREMIUM }}
            className="text-base sm:text-lg text-sage mt-4 max-w-lg leading-relaxed"
          >
            Heavyweight cotton. French terry. Fleece. Oversized silhouettes made for the everyday.
            From the stands to the streets.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto border-t border-olive/10 bg-navy/50">
        <div className="flex flex-wrap items-center gap-4 text-[11px] tracking-[0.15em] uppercase">
          <span className="text-sage/50">FILTER:</span>
          <Link
            href={ROUTES.STREETWEAR}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              !category && !sort ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            All
          </Link>
          <Link
            href={`${ROUTES.STREETWEAR}?category=tees`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              category === 'tees' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Tees
          </Link>
          <Link
            href={`${ROUTES.STREETWEAR}?category=hoodies`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              category === 'hoodies' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Hoodies
          </Link>
          <Link
            href={`${ROUTES.STREETWEAR}?category=sweatshirts`}
            className={`px-4 py-2 rounded text-sage hover:text-gold transition-colors ${
              category === 'sweatshirts' ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            Sweatshirts
          </Link>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-olive">
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

export default function StreetwearPage() {
  return (
    <Suspense fallback={<div className="py-8" />}>
      <StreetwearPageContent />
    </Suspense>
  );
}