'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';
import { imageReveal, clipReveal, fadeUpSmall, EASE_PREMIUM, DURATION } from '@/components/motion/motion-variants';

export function FeaturedDrop() {
  const shouldReduceMotion = useReducedMotion();

  const imageDuration = shouldReduceMotion ? 0.01 : DURATION.hero;
  const textDuration = shouldReduceMotion ? 0.01 : 0.7;

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] overflow-hidden bg-navy">
      {/* Background image */}
      <motion.div
        variants={imageReveal}
        initial="hidden"
        animate="visible"
        style={{
          transitionDuration: `${imageDuration}s`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1600&q=85"
          alt="HEADERR Featured Drop - Campaign"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            {/* Headline with clip reveal */}
            <motion.h2
              variants={clipReveal}
              initial="hidden"
              animate="visible"
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '200ms',
                transitionDuration: shouldReduceMotion ? '0.01s' : '0.8s',
              }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95]"
            >
              <span>FEATURED</span>
              <br />
              <span>DROP</span>
            </motion.h2>

            {/* Supporting copy */}
            <motion.p
              variants={fadeUpSmall}
              initial="hidden"
              animate="visible"
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '400ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="text-base sm:text-lg text-off-white/70 mt-6 max-w-lg leading-relaxed"
            >
              Limited edition release. Player Version kits from the 2026 World Cup cycle.
              Once gone, they&apos;re gone forever.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUpSmall}
              initial="hidden"
              animate="visible"
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '600ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="mt-10"
            >
              <Link
                href={ROUTES.SHOP}
                className="inline-flex items-center gap-3 bg-gold text-navy px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-bronze transition-all duration-500 group"
              >
                Shop the Drop
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}