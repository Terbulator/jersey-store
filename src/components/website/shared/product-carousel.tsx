'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '../product/product-card';
import { ROUTES } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CarouselSectionProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  productIds: string[];
}

export function ProductCarousel({ title, subtitle, ctaLabel, ctaHref, productIds }: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = PRODUCTS.filter((p) => productIds.includes(p.id));

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xs tracking-widest uppercase text-blood-red mb-1">{title}</h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal">{subtitle}</h3>
          </div>
          <Link href={ctaHref} className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-blood-red transition-colors">
            {ctaLabel} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(-1)}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-off-white border border-charcoal/10 items-center justify-center z-10 hover:bg-blood-red hover:text-off-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 bg-off-white border border-charcoal/10 items-center justify-center z-10 hover:bg-blood-red hover:text-off-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="sm:hidden flex justify-center mt-4">
          <Link href={ctaHref} className="text-xs tracking-widest uppercase text-blood-red hover:underline">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}