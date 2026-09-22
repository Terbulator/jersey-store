'use client';

import { motion } from 'framer-motion';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

const EXPERT_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80';

const ARGUMENTS = [
  { value: '10', label: 'Checks per seam' },
  { value: '30', label: 'Wash-test passes' },
  { value: '0', label: 'Seconds in the scalper cart' },
];

export function ExpertSection() {
  return (
    <section className="bg-black py-20 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE_PREMIUM }}
        >
          <p className="eyebrow">Why We&rsquo;re Different</p>
          <h2 className="headline text-4xl sm:text-5xl text-off-white mt-4 leading-[1.05]">
            History
            <br />
            <em className="text-off-white/40 not-italic">Won&rsquo;t Skip Us.</em>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-off-white/60 max-w-md leading-relaxed">
            We&rsquo;re a crew of kit lovers who check every single stitch. Every jersey
            gets a 10-point inspection before it&rsquo;s packed. Nothing ships that we
            wouldn&rsquo;t wear to the final.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {ARGUMENTS.map((arg) => (
              <div key={arg.label}>
                <p className="headline text-3xl sm:text-4xl text-off-white">{arg.value}</p>
                <p className="font-mono-meta text-[9px] text-off-white/50 mt-1.5 uppercase tracking-wider leading-relaxed">
                  {arg.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: EASE_PREMIUM }}
          className="relative aspect-[4/5] overflow-hidden"
        >
          <img
            src={EXPERT_IMAGE}
            alt="Quality inspection"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 left-4 font-mono-meta text-[9px] text-off-white/70 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
            QC PASS — SEAN #001
          </span>
        </motion.div>
      </div>
    </section>
  );
}