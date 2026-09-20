'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '../product/product-card';
import { Reveal } from './reveal';
import { ROUTES } from '@/lib/utils';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  productIds: string[];
}

export function ProductCarousel({
  title,
  subtitle,
  ctaLabel = 'View All',
  ctaHref = ROUTES.SHOP,
  productIds,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const products = productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-28">
      <Reveal>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 flex items-end justify-between mb-10 sm:mb-14">
          <div>
            {subtitle && (
              <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
                {subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
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
              href={ctaHref}
              className="ml-2 text-[11px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-300 border-b border-charcoal/20 pb-0.5 hover:border-blood-red/40"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </Reveal>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-6 sm:px-8 lg:px-12 hide-scrollbar scroll-smooth"
        style={{ scrollPaddingInline: '1.5rem' }}
      >
        {products.map((product, i) => (
          <Reveal key={product!.id} delay={i * 0.06}>
            <div className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start">
              <ProductCard product={product!} />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 sm:hidden text-center">
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-300"
        >
          {ctaLabel}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
