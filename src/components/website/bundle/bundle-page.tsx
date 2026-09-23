'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Edition, Product } from '@/lib/storefront-types';
import { ProductCard } from '@/components/website/product/product-card';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'starter',
    label: 'The Starter',
    items: 1,
    price: 2599,
    old: 2999,
    desc: 'One jersey, box fresh. Free shipping + gift wrap.',
    popular: false,
  },
  {
    id: 'double',
    label: 'The Double',
    items: 2,
    price: 4699,
    old: 5598,
    desc: 'Two jerseys picked together. Extra 10% off.',
    popular: true,
  },
  {
    id: 'triple',
    label: 'The Triple',
    items: 3,
    price: 6699,
    old: 8097,
    desc: 'Three jerseys + an oversized tee. Best value.',
    popular: false,
  },
];

const INCLUDED = [
  { icon: '🏷️', title: 'Save up to 20%', desc: 'Every bundle drops under the already-low drop price.' },
  { icon: '🚚', title: 'Free fast shipping', desc: 'All bundles ship free with tracking, in 3–5 days.' },
  { icon: '🔄', title: '30-day returns', desc: 'Change your mind? Send it back, no questions.' },
  { icon: '🎁', title: 'Gift-wrapped', desc: 'Every bundle ships packed like a proper flex.' },
];

export function BundlePageClient({
  products,
  editions,
}: {
  products: Product[];
  editions: Edition[];
}) {
  const [active, setActive] = useState('double');
  const plan = PLANS.find((p) => p.id === active)!;

  return (
    <>
      <section className="pt-36 sm:pt-44 pb-16 sm:pb-20 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-black">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="max-w-2xl"
        >
          <p className="eyebrow">Bundle &amp; Save</p>
          <h1 className="headline text-4xl sm:text-5xl lg:text-6xl text-off-white mt-3 leading-[1.02]">
            Stack the Kit.
            <br />
            <em className="text-red not-italic">Drop the Price.</em>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-off-white/60 leading-relaxed">
            Pick a size. Stack jerseys. Save up to 20%. Every bundle ships free,
            gift-wrapped, and ready to flex.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {PLANS.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: EASE_PREMIUM }}
              onClick={() => setActive(p.id)}
              className={cn(
                'relative text-left p-6 rounded-2xl border transition-all duration-300',
                active === p.id
                  ? 'border-red bg-charcoal'
                  : 'border-white/10 bg-black hover:border-white/25'
              )}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-red text-off-white font-mono-meta text-[9px] tracking-widest rounded-full">
                  MOST POPULAR
                </span>
              )}
              <p className="font-mono-meta text-[10px] text-off-white/50 tracking-widest uppercase">
                {p.label}
              </p>
              <p className="headline text-3xl text-off-white mt-3">
                {formatPrice(p.price)}
              </p>
              <p className="text-xs text-off-white/40 line-through mt-1">{formatPrice(p.old)}</p>
              <p className="text-sm text-off-white/60 mt-3 leading-relaxed">{p.desc}</p>
              <p className="font-mono-meta text-[9px] text-red mt-4">
                {p.items} ITEM{p.items > 1 ? 'S' : ''}
              </p>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE_PREMIUM }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/shop"
            className="btn-pill btn-pill-solid"
          >
            Start my {plan.items}-item bundle <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <p className="font-mono-meta text-[9px] text-off-white/40">
            You pick the jerseys. We handle the math.
          </p>
        </motion.div>
      </section>

      <section className="bg-off-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="mb-10">
            <p className="eyebrow eyebrow-dark">What you get</p>
            <h2 className="headline text-3xl sm:text-4xl text-navy mt-3">
              Bundling is better.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INCLUDED.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE_PREMIUM }}
                className="p-6 rounded-2xl bg-off-white border border-black/10 hover:border-navy/30 transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="headline text-lg text-navy mt-3">{item.title}</h3>
                <p className="text-[13px] text-chrome mt-1.5 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <h2 className="headline text-3xl sm:text-4xl text-off-white">
              Start with a favourite
            </h2>
            <Link
              href="/shop"
              className="flex items-center gap-2 text-xs text-off-white/60 hover:text-off-white transition-colors border-b border-white/20 pb-1"
            >
              View all <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} editions={editions} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}