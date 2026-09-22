'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { bestSellers } from '@/lib/catalog';
import { ProductGrid } from '../product/product-grid';
import { ROUTES } from '@/lib/utils';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

export function BestSellers() {
  return (
    <section className="bg-off-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
          className="flex flex-wrap items-end justify-between gap-6 mb-12"
        >
          <div>
            <p className="eyebrow eyebrow-dark">The Drop</p>
            <h2 className="headline text-4xl sm:text-5xl lg:text-6xl text-navy mt-3">
              Best Sellers
            </h2>
          </div>
          <Link
            href={ROUTES.SHOP}
            className="group flex items-center gap-2 text-xs text-navy font-medium border-b border-navy/20 pb-1 hover:border-navy transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </motion.div>

        <ProductGrid products={bestSellers()} />
      </div>
    </section>
  );
}