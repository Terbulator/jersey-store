'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';
import { formatPrice } from '@/lib/utils';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80';
const DEFAULT_PRICING = [
  { label: 'The Starter', items: '1 Jersey', price: 2499, was: 2999 },
  { label: 'The Double', items: '2 Jerseys', price: 4499, was: 5598 },
  { label: 'The Triple', items: '3 Jerseys + Tee', price: 6499, was: 8897 },
];

interface BSSettings { heading?: string; subheading?: string; image_url?: string; pricing?: { label: string; items: string; price: number; was: number }[] }

export function BundleSection({ settings }: { settings?: BSSettings | null }) {
  const heading = settings?.heading ?? 'More Kit.';
  const sub = settings?.subheading ?? 'Less Slip.';
  const pricing = settings?.pricing ?? DEFAULT_PRICING;
  const image = settings?.image_url ?? DEFAULT_IMAGE;

  return (
    <section className="bg-charcoal py-20 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: EASE_PREMIUM }}>
            <p className="eyebrow">Bundle &amp; Save</p>
            <h2 className="headline text-4xl sm:text-5xl lg:text-6xl text-off-white mt-4 leading-[1.05]">{heading}<br /><em className="text-red not-italic">{sub}.</em></h2>
            <p className="mt-6 text-base sm:text-lg text-off-white/60 max-w-md leading-relaxed">Stack jerseys, drop the price. Every bundle ships free, gift-wrapped, ready to flex.</p>
            <div className="mt-10 space-y-3">
              {pricing.map((tier) => (
                <div key={tier.label} className="flex items-center justify-between px-5 py-4 border border-white/10 rounded-xl hover:border-white/30 transition-colors">
                  <div><p className="headline text-lg text-off-white">{tier.label}</p><p className="font-mono-meta text-[9px] text-off-white/50 mt-0.5">{tier.items}</p></div>
                  <div className="text-right"><p className="text-lg text-off-white font-medium">{formatPrice(tier.price)}</p><p className="text-xs text-off-white/40 line-through">{formatPrice(tier.was)}</p></div>
                </div>
              ))}
            </div>
            <Link href="/bundle" className="group inline-flex items-center gap-2 mt-10 text-sm text-off-white font-medium">Build your bundle <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} /></Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 1.05 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1, ease: EASE_PREMIUM }} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <img src={image} alt="HEADERR bundle stack" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <span className="absolute top-5 left-5 font-mono-meta text-[9px] text-off-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">THE 2026 STACK</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
