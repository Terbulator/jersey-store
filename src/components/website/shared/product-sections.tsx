'use client';

import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '../product/product-card';
import { Reveal } from './reveal';
import { ROUTES } from '@/lib/utils';

export function NewArrivalsSection() {
  const products = PRODUCTS.filter((p) => p.badge === 'NEW' || p.badge === 'LIMITED').slice(0, 8);

  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal>
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
              Just Dropped
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              THE LATEST
            </h2>
          </div>
          <Link
            href={ROUTES.SHOP}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-300 border-b border-charcoal/20 pb-0.5 hover:border-blood-red/40"
          >
            View All
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.06}>
            <ProductCard product={product} />
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

export function BestSellersSection() {
  const products = PRODUCTS.filter((p) => p.badge === 'SALE').slice(0, 8);

  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal>
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
              Crowd Favorites
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              BESTSELLERS
            </h2>
          </div>
          <Link
            href={`${ROUTES.SHOP}?sort=best-selling`}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-300 border-b border-charcoal/20 pb-0.5 hover:border-blood-red/40"
          >
            View All
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.06}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>

      <div className="mt-8 sm:hidden text-center">
        <Link
          href={`${ROUTES.SHOP}?sort=best-selling`}
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
