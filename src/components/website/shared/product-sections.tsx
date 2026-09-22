'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '../product/product-card';
import { Reveal } from '../shared/reveal';
import { ROUTES } from '@/lib/utils';
import { productGridStagger } from '@/components/motion/motion-variants';

export function NewArrivalsSection() {
  const products = PRODUCTS.filter((p) => p.badge === 'NEW' || p.badge === 'LIMITED').slice(0, 8);

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal className="mb-10 sm:mb-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">
              Just Dropped
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-off-white">
              NEW ARRIVALS
            </h2>
          </div>
          <Link
            href={ROUTES.SHOP}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-sage hover:text-gold transition-colors duration-300 border-b border-sage/20 pb-0.5 hover:border-gold/40"
          >
            View All
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>
      </Reveal>

      <motion.div
        variants={productGridStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="product-grid"
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            custom={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 sm:hidden text-center">
        <Link
          href={ROUTES.SHOP}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-sage hover:text-gold transition-colors duration-300"
        >
          View All
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

export function BestSellersSection() {
  const products = PRODUCTS.filter((p) => p.badge === 'SALE').slice(0, 8);

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal className="mb-10 sm:mb-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">
              Crowd Favorites
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-off-white">
              BESTSELLERS
            </h2>
          </div>
          <Link
            href={`${ROUTES.SHOP}?sort=best-selling`}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-sage hover:text-gold transition-colors duration-300 border-b border-sage/20 pb-0.5 hover:border-gold/40"
          >
            View All
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>
      </Reveal>

      <motion.div
        variants={productGridStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="product-grid"
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            custom={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 sm:hidden text-center">
        <Link
          href={`${ROUTES.SHOP}?sort=best-selling`}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-sage hover:text-gold transition-colors duration-300"
        >
          View All
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </Link>
      </div>
    </section>
  );
}