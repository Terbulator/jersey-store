'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/data/products';
import { PromoCard } from './promo-card';
import { Reveal } from '../shared/reveal';
import { ROUTES } from '@/lib/utils';
import { cn } from '@/lib/utils';

const SCROLL_AMOUNT = 360;

interface TeamData {
  name: string;
  slug: string;
  image: string;
  imageAlt: string;
  category: string;
  count: number;
}

function getTeamData(): TeamData[] {
  const teamMap = new Map<string, { products: typeof PRODUCTS[number][]; image: string; imageAlt: string }>();

  PRODUCTS.forEach((product) => {
    if (!teamMap.has(product.team)) {
      teamMap.set(product.team, {
        products: [],
        image: product.image,
        imageAlt: product.imageAlt || product.name,
      });
    }
    teamMap.get(product.team)!.products.push(product);
  });

  return Array.from(teamMap.entries())
    .map(([name, data]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      image: data.image,
      imageAlt: data.imageAlt,
      category: data.products[0].category,
      count: data.products.length,
    }))
    .sort((a, b) => b.count - a.count);
}

export function TeamCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const teams = getTeamData();

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12">
      <Reveal className="max-w-[1400px] mx-auto mb-10 sm:mb-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
              Shop by Team
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              CLUB & NATIONAL KITS
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="w-10 h-10 border border-charcoal/15 flex items-center justify-center hover:bg-charcoal hover:text-off-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="w-10 h-10 border border-charcoal/15 flex items-center justify-center hover:bg-charcoal hover:text-off-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <Link
              href={ROUTES.SHOP}
              className="ml-2 text-[11px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-300 border-b border-charcoal/20 pb-0.5 hover:border-blood-red/40"
            >
              View All
            </Link>
          </div>
        </div>
      </Reveal>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
        style={{ scrollPaddingInline: '1.5rem' }}
      >
        {teams.map((team, i) => (
          <Reveal key={team.name} delay={i * 0.04}>
            <div className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <PromoCard
                image={team.image}
                imageAlt={team.imageAlt}
                eyebrow={team.category.toUpperCase()}
                title={team.name}
                subtitle={`${team.count} item${team.count !== 1 ? 's' : ''}`}
                href={`${ROUTES.SHOP}?team=${team.slug}`}
                ctaLabel="Shop Team"
                aspectRatio="portrait"
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 sm:hidden text-center">
        <Link
          href={ROUTES.SHOP}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-300"
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