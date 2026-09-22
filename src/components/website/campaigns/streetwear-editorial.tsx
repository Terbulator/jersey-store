'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { ROUTES } from '@/lib/utils';
import { imageReveal, clipReveal, fadeUpSmall, EASE_PREMIUM, DURATION } from '@/components/motion/motion-variants';
import { HoverArrow } from '@/components/motion/menu';

export function StreetwearEditorial() {
  const shouldReduceMotion = useReducedMotion();
  const { ref, isInView } = useInView({ margin: '-100px' });

  const imageDuration = shouldReduceMotion ? 0.01 : DURATION.hero;
  const textDuration = shouldReduceMotion ? 0.01 : 0.7;

  return (
    <section ref={ref} className="relative min-h-[70vh] sm:min-h-[80vh] overflow-hidden bg-olive">
      {/* Full-width background with large negative space */}
      <motion.div
        variants={imageReveal}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        style={{
          transitionDuration: `${imageDuration}s`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=85"
          alt="HEADERR Streetwear - Oversized tee in urban setting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-olive/40 via-olive/10 to-olive/60" />
      </motion.div>

      {/* Content — right aligned with negative space on left */}
      <div className="absolute inset-0 flex items-center justify-end">
        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12 pr-20 lg:pr-32">
          <div className="max-w-lg text-right">
            {/* Label */}
            <motion.p
              variants={fadeUpSmall}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '200ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="text-[10px] tracking-[0.2em] uppercase text-gold mb-4 font-medium"
            >
              Streetwear
            </motion.p>

            {/* Headline with clip reveal */}
            <motion.h2
              variants={clipReveal}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '400ms',
                transitionDuration: shouldReduceMotion ? '0.01s' : '0.8s',
              }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95] uppercase"
            >
              <span>WEAR THE</span>
              <br />
              <span>CULTURE.</span>
            </motion.h2>

            {/* Supporting copy */}
            <motion.p
              variants={fadeUpSmall}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '600ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="text-base sm:text-lg text-off-white/70 mt-6 max-w-lg leading-relaxed text-right"
            >
              Heavyweight cotton. French terry. Fleece. Oversized silhouettes made for the everyday.
              From the stands to the streets.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUpSmall}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '800ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="mt-10 flex justify-end"
            >
              <HoverArrow reducedMotion={shouldReduceMotion}>
                <Link
                  href={ROUTES.STREETWEAR}
                  className="inline-flex items-center gap-2 bg-gold text-navy px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-bronze transition-all duration-500 group"
                >
                  Shop Streetwear
                  <svg className="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </Link>
              </HoverArrow>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}