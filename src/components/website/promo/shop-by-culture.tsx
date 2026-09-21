'use client';

import { motion } from 'framer-motion';
import { CATEGORIES } from '@/data/products';
import { PromoCard } from './promo-card';
import { Reveal } from '../shared/reveal';
import { ROUTES } from '@/lib/utils';

export function ShopByCulture() {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-12 sm:mb-16">
        <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
          Explore
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          SHOP BY CULTURE
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 0.08}>
            <PromoCard
              image={cat.image}
              imageAlt={cat.name}
              eyebrow={cat.label}
              title={cat.name.toUpperCase()}
              subtitle={cat.description}
              href={cat.slug === 'football' ? ROUTES.FOOTBALL : cat.slug === 'cricket' ? ROUTES.CRICKET : ROUTES.STREETWEAR}
              ctaLabel="Shop Now"
              aspectRatio="portrait"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}