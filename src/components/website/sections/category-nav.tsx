'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '@/lib/storefront-types';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

interface CatNavSettings { heading?: string }

export function CategoryNav({ categories, settings }: { categories: Category[]; settings?: CatNavSettings | null }) {
  if (categories.length === 0) return null;
  const heading = settings?.heading ?? 'Three Games.';

  return (
    <section className="section-gap bg-black">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow">Shop by Category</p>
            <h2 data-cms="heading" data-sec-h style={{ color: 'var(--sec-heading, var(--th-text-inverse))' }} className="headline text-4xl sm:text-5xl lg:text-6xl text-off-white mt-3">
              {heading}
              <br />One House.
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: i * 0.1, duration: 0.7, ease: EASE_PREMIUM }}>
              <Link href={`/shop/${cat.slug}`} className="group block relative aspect-[3/4] bg-charcoal overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <div>
                    <p style={{ color: 'var(--sec-accent, var(--th-brand-primary))' }} className="font-mono-meta text-[10px] tracking-[0.3em] text-red mb-2">{cat.label}</p>
                    <h3 className="headline text-3xl sm:text-4xl text-off-white">{cat.name}</h3>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-off-white/60 group-hover:text-off-white transition-colors" strokeWidth={1.5} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
