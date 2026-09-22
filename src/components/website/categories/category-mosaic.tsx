'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { HoverScale, HoverArrow, HoverLift } from '@/components/motion/menu';
import { categoryMosaicStagger, EASE_PREMIUM } from '@/components/motion/motion-variants';
import { ROUTES } from '@/lib/utils';

interface CategoryMosaicItem {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  dominant?: boolean;
  aspectRatio: 'portrait' | 'landscape' | 'square';
}

const CATEGORIES: CategoryMosaicItem[] = [
  {
    id: 'football',
    label: 'FOOTBALL',
    title: 'CLUBS & NATIONALS',
    description: 'Player Version, Master Edition & Special Edition kits from the world\'s biggest clubs and national teams.',
    image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=1200&q=85',
    imageAlt: 'HEADERR Football collection - Club and National team jerseys',
    href: ROUTES.FOOTBALL,
    ctaLabel: 'SHOP FOOTBALL',
    dominant: true,
    aspectRatio: 'landscape',
  },
  {
    id: 'cricket',
    label: 'CRICKET',
    title: 'TEAM & INTERNATIONAL',
    description: 'IPL franchises, international sides & limited drops. Player Version & Master Edition.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=85',
    imageAlt: 'HEADERR Cricket collection - IPL and International jerseys',
    href: ROUTES.CRICKET,
    ctaLabel: 'SHOP CRICKET',
    aspectRatio: 'portrait',
  },
  {
    id: 'streetwear',
    label: 'STREETWEAR',
    title: 'OVERSIZED ESSENTIALS',
    description: 'Heavyweight tees, French terry hoodies & fleece crewnecks. Made for the everyday.',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=85',
    imageAlt: 'HEADERR Streetwear collection - Oversized tees and hoodies',
    href: ROUTES.STREETWEAR,
    ctaLabel: 'SHOP STREETWEAR',
    aspectRatio: 'portrait',
  },
];

export function CategoryMosaic() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <div className="mb-12 sm:mb-16">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">
          Discover
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-off-white">
          SHOP BY CULTURE
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {CATEGORIES.map((cat, index) => (
          <motion.div
            key={cat.id}
            variants={categoryMosaicStagger}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className={cat.dominant ? 'lg:col-span-7' : 'lg:col-span-5'}
          >
            <Link href={cat.href} className="group block relative">
              <div className={`overflow-hidden relative ${
                cat.aspectRatio === 'landscape' ? 'aspect-[16/9] lg:aspect-[4/3]' :
                cat.aspectRatio === 'portrait' ? 'aspect-[3/4] lg:aspect-[9/16]' :
                'aspect-square'
              }`}>
                <HoverScale scale="medium" reducedMotion={shouldReduceMotion}>
                  <img
                    src={cat.image}
                    alt={cat.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </HoverScale>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
                <HoverLift reducedMotion={shouldReduceMotion}>
                  <div className="flex flex-col gap-3 max-w-xl">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-off-white/50 font-medium">
                      {cat.label}
                    </p>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-off-white leading-[0.95] uppercase">
                      {cat.title}
                    </h3>
                    <p className="text-sm sm:text-base text-off-white/60 max-w-md leading-relaxed">
                      {cat.description}
                    </p>
                    <HoverArrow reducedMotion={shouldReduceMotion}>
                      <div className="inline-flex items-center gap-2 text-off-white text-[11px] tracking-[0.15em] uppercase font-medium">
                        {cat.ctaLabel}
                        <svg className="w-3.5 h-3.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </div>
                    </HoverArrow>
                  </div>
                </HoverLift>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}