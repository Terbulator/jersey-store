'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

const DEFAULT_SPLIT_IMAGE = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80';
const DEFAULT_POINTS = [
  'Player-version cuts that move like the pros',
  'Master-edition fabric that survives 30 washes',
  'Brutally checked stitching — no loose threads',
];

interface ESSettings { heading?: string; subheading?: string; points?: string[]; image_url?: string; cta_text?: string; cta_url?: string }

export function EditorialSplit({ settings }: { settings?: ESSettings | null }) {
  const heading = settings?.heading ?? 'Built like the Kit.';
  const sub = settings?.subheading ?? 'Made for the Fan.';
  const points = settings?.points ?? DEFAULT_POINTS;
  const image = settings?.image_url ?? DEFAULT_SPLIT_IMAGE;
  const cta = settings?.cta_text ?? 'Our Standard';
  const ctaUrl = settings?.cta_url ?? '/about';

  return (
    <section className="bg-black py-20 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, scale: 1.05 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1, ease: EASE_PREMIUM }} className="relative aspect-[4/5] overflow-hidden">
          <img src={image} alt="Jersey detail" data-cms="image" className="w-full h-full object-cover" />
          <span className="absolute bottom-4 left-4 font-mono-meta text-[9px] text-off-white/70 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">FIG. 01 — THE CONSTRUCTION</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: EASE_PREMIUM }}>
          <p className="eyebrow">The HEADERR Standard</p>
          <h2 data-cms="heading" data-sec-h style={{ color: 'var(--sec-heading, var(--th-text-inverse))' }} className="headline text-4xl sm:text-5xl lg:text-6xl text-off-white mt-4 leading-[1.05]">{heading}<br /><em className="text-off-white/50 not-italic">{sub}</em></h2>
          <p style={{ color: 'var(--sec-body, var(--th-text-inverse-soft))' }} className="mt-6 text-base sm:text-lg text-off-white/60 max-w-md leading-relaxed">Every piece is cut from premium fabrics and checked stitch-by-stitch before it makes the drop list. No knock-offs. No shortcuts.</p>
          <ul data-cms="points" className="mt-10 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-off-white/80"><span className="w-1.5 h-1.5 rounded-full bg-red shrink-0" />{point}</li>
            ))}
          </ul>
          <Link href={ctaUrl} data-cms="button" className="btn-pill btn-pill-outline mt-12">{cta}</Link>
        </motion.div>
      </div>
    </section>
  );
}
