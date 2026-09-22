'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { PRODUCTS } from '@/data/products';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 199,
    period: 'month',
    desc: 'A jersey every month. Cancel anytime.',
    featured: false,
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    price: 549,
    period: 'quarter',
    desc: 'Save 8% vs monthly. Ships every 3 months.',
    featured: true,
  },
  {
    id: 'season',
    label: 'Season Pass',
    price: 1999,
    period: 'season',
    desc: 'All 4 seasons. Best value, limited spots.',
    featured: false,
  },
];

const PERKS = [
  'Hand-picked jerseys, shipped on schedule',
  'First access to limited-edition drops',
  'Members-only pricing on everything',
  'Free express shipping on every box',
  'Pause or cancel anytime, no lock-in',
];

export default function SubscribePage() {
  const [plan, setPlan] = useState('quarterly');
  const active = TIERS.find((t) => t.id === plan)!;
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const join = () => {
    const product = PRODUCTS.find((p) => p.slug === 'header-oversized-tee');
    if (product) {
      addItem(product, 'M');
      openCart();
    }
  };

  return (
    <>
      <section className="pt-36 sm:pt-44 pb-16 sm:pb-20 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-black">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="max-w-2xl"
        >
          <p className="eyebrow">HEADERR Club</p>
          <h1 className="headline text-4xl sm:text-5xl lg:text-6xl text-off-white mt-3 leading-[1.02]">
            Every Season.
            <br />
            <em className="text-red not-italic">Fresh Kit.</em>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-off-white/60 leading-relaxed">
            Subscribe to the Club and get a hand-picked jersey on schedule, plus
            first access to limited drops.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {TIERS.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: EASE_PREMIUM }}
              onClick={() => setPlan(t.id)}
              className={cn(
                'relative text-left p-6 rounded-2xl border transition-all duration-300',
                active.id === t.id
                  ? 'border-red bg-charcoal'
                  : 'border-white/10 bg-black hover:border-white/25'
              )}
            >
              {t.featured && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-red text-off-white font-mono-meta text-[9px] tracking-widest rounded-full">
                  BEST VALUE
                </span>
              )}
              <p className="font-mono-meta text-[10px] text-off-white/50 tracking-widest uppercase">
                {t.label}
              </p>
              <p className="headline text-3xl text-off-white mt-3">{formatPrice(t.price)}</p>
              <p className="font-mono-meta text-[9px] text-off-white/40 mt-1">
                per {t.period}
              </p>
              <p className="text-sm text-off-white/60 mt-3 leading-relaxed">{t.desc}</p>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE_PREMIUM }}
          className="max-w-2xl"
        >
          <button onClick={join} className="btn-pill btn-pill-solid mt-10">
            Join the {active.label} — {formatPrice(active.price)}/{active.period}
          </button>
          <p className="font-mono-meta text-[9px] text-off-white/40 mt-3">
            Not a real subscription. This demo just adds a tee to your bag.
          </p>
        </motion.div>
      </section>

      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="eyebrow">The perks</p>
            <h2 className="headline text-3xl sm:text-4xl text-off-white mt-3 mb-8">
              Members get everything.
            </h2>
            <ul className="space-y-4">
              {PERKS.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: EASE_PREMIUM }}
                  className="flex items-center gap-3 text-sm text-off-white/80"
                >
                  <span className="w-5 h-5 rounded-full bg-red flex items-center justify-center text-off-white shrink-0">
                    <Check className="w-3 h-3" strokeWidth={2} />
                  </span>
                  {perk}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-2xl border border-white/10 bg-black">
            <p className="font-mono-meta text-[10px] text-off-white/50 tracking-widest uppercase mb-4">
              How it works
            </p>
            <div className="space-y-6">
              {[
                { n: '01', t: 'Pick a plan', d: 'Monthly, quarterly, or the Season Pass.' },
                { n: '02', t: 'We pick the kit', d: 'Player versions, master editions, limited drops.' },
                { n: '03', t: 'It arrives', d: 'Free express shipping, gift-wrapped, on time.' },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <span className="headline text-xl text-red">{step.n}</span>
                  <div>
                    <p className="text-sm text-off-white font-medium">{step.t}</p>
                    <p className="text-xs text-off-white/50 mt-1">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}