'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AppWindow, Store, ShieldCheck } from 'lucide-react';
import type { Edition, Product } from '@/lib/storefront-types';
import { productsByEdition } from '@/lib/catalog';
import { ProductGrid } from '../product/product-grid';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

interface ESSettings { heading?: string; subheading?: string }

export function EditionsSection({ editions, products, settings }: { editions: Edition[]; products: Product[]; settings?: ESSettings | null }) {
  const [active, setActive] = useState(editions[0]?.id ?? '');
  const activeEdition = editions.find((e) => e.id === active);
  if (editions.length === 0 || !activeEdition) return null;
  const activeProducts = productsByEdition(products, activeEdition.slug);
  const heading = settings?.heading ?? 'Pick Your Grade';
  const sub = settings?.subheading ?? 'Three grades, one obsession. Whatever you wear, it&rsquo;s built to last.';

  return (
    <section className="bg-off-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div><p className="eyebrow eyebrow-dark">The Editions</p><h2 data-cms="heading" data-sec-h style={{ color: 'var(--sec-heading, var(--th-surface-ink))' }} className="headline text-4xl sm:text-5xl text-navy mt-3">{heading}</h2></div>
          <p data-cms="subheading" style={{ color: 'var(--sec-body, var(--th-text-secondary))' }} className="text-sm text-chrome max-w-[280px] leading-relaxed hidden sm:block">{sub}</p>
        </div>
        <div className="flex gap-2 mb-10 border-b border-black/10 pb-0 overflow-x-auto">
          {editions.map((edition) => (
            <button key={edition.id} onClick={() => setActive(edition.id)} className={`px-5 py-3 text-[11px] font-mono-meta whitespace-nowrap transition-colors border-b-2 ${active === edition.id ? 'border-red text-navy' : 'border-transparent text-chrome hover:text-navy'}`}>
              {edition.icon} {edition.name}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: EASE_PREMIUM }}>
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <h3 className="headline text-2xl sm:text-3xl text-navy">{activeEdition.name}</h3>
              <div className="flex items-center gap-6 text-[11px] font-mono-meta text-chrome">
                <span className="flex items-center gap-1.5"><AppWindow className="w-3.5 h-3.5" strokeWidth={1.5} /> On-pitch feel</span>
                <span className="flex items-center gap-1.5"><Store className="w-3.5 h-3.5" strokeWidth={1.5} /> Signature fabric</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> Verified quality</span>
              </div>
            </div>
            <ProductGrid products={activeProducts} editions={editions} />
            {activeProducts.length === 0 && <p className="text-sm text-chrome">0 products in this edition yet — the {activeEdition.name} drop lands Friday.</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
