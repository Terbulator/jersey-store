'use client';

import { motion } from 'framer-motion';
import { PromoCard } from './promo-card';
import { Reveal } from '../shared/reveal';
import { ROUTES } from '@/lib/utils';

const SECONDARY_PROMO_CARDS = [
  {
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=85',
    imageAlt: 'Player Version jersey',
    eyebrow: 'PLAYER VERSION',
    title: 'MATCH READY',
    subtitle: 'Lightweight, breathable. Built for 90 minutes at the highest level.',
    href: `${ROUTES.SHOP}?edition=player`,
    ctaLabel: 'Shop Player',
  },
  {
    image: 'https://images.unsplash.com/photo-1598221428011-33ef7e864d49?w=800&q=85',
    imageAlt: 'Master Edition jersey',
    eyebrow: 'MASTER EDITION',
    title: 'PREMIUM KNITS',
    subtitle: 'Heavyweight craft. Club crest woven in. For the connoisseur.',
    href: `${ROUTES.SHOP}?edition=master`,
    ctaLabel: 'Shop Master',
  },
];

export function SecondaryPromoRow() {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal className="text-center mb-12 sm:mb-16">
        <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
          Editions
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          CHOOSE YOUR LEVEL
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {SECONDARY_PROMO_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.1}>
            <PromoCard
              image={card.image}
              imageAlt={card.imageAlt}
              eyebrow={card.eyebrow}
              title={card.title}
              subtitle={card.subtitle}
              href={card.href}
              ctaLabel={card.ctaLabel}
              aspectRatio="portrait"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}