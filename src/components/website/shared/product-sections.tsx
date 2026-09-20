'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '../product/product-card';
import { ROUTES } from '@/lib/utils';

const NEW_ARRIVALS = PRODUCTS.filter((p) => p.badge === 'NEW' || p.badge === 'LIMITED').slice(0, 8);
const BEST_SELLERS = PRODUCTS.filter((p) => p.badge === 'SALE').slice(0, 8);

export function NewArrivalsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xs tracking-widest uppercase text-blood-red mb-1">JUST LANDED</h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal">New Arrivals</h3>
            <p className="text-sm text-chrome mt-2">Fresh from the drop.</p>
          </div>
          <Link href={`${ROUTES.SHOP}?sort=newest`} className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-blood-red transition-colors">
            VIEW ALL →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {NEW_ARRIVALS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="sm:hidden text-center mt-6">
          <Link href={`${ROUTES.SHOP}?sort=newest`} className="text-xs tracking-widest uppercase text-blood-red hover:underline">
            VIEW ALL →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BestSellersSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xs tracking-widest uppercase text-blood-red mb-1">THE ONES EVERYONE WANTS</h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal">Best Sellers</h3>
            <p className="text-sm text-chrome mt-2">Most worn. Most wanted.</p>
          </div>
          <Link href={`${ROUTES.SHOP}?sort=best-selling`} className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-blood-red transition-colors">
            VIEW ALL →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {BEST_SELLERS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="sm:hidden text-center mt-6">
          <Link href={`${ROUTES.SHOP}?sort=best-selling`} className="text-xs tracking-widest uppercase text-blood-red hover:underline">
            VIEW ALL →
          </Link>
        </div>
      </div>
    </section>
  );
}