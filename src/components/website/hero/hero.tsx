'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';
import { imageReveal, heroTextStagger, clipReveal, EASE_PREMIUM, DURATION } from '@/components/motion/motion-variants';

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const imageDuration = shouldReduceMotion ? 0.01 : DURATION.hero;
  const textDuration = shouldReduceMotion ? 0.01 : 0.7;

  return (
    <section className="relative h-[100svh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background image - using real HEADERR campaign photography */}
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
          src="https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=1600&q=85"
          alt="HEADERR 2026 Collection - Football culture"
          className="w-full h-full object-cover"
        />
        {/* Subtle gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </motion.div>

      {/* Content — bottom-left aligned */}
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-2xl">
            {/* Label */}
            <motion.p
              variants={heroTextStagger}
              custom={0}
              initial="hidden"
              animate="visible"
              className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-off-white/70 mb-4 sm:mb-5 font-medium"
            >
              2026 Collection
            </motion.p>

            {/* Headline with clip reveal */}
            <motion.h1
              variants={clipReveal}
              initial="hidden"
              animate="visible"
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '550ms',
                transitionDuration: shouldReduceMotion ? '0.01s' : '0.8s',
              }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95]"
            >
              <span>WEAR</span>
              <br />
              <span>THE GAME.</span>
            </motion.h1>

            {/* Single supporting line */}
            <motion.p
              variants={heroTextStagger}
              custom={1}
              initial="hidden"
              animate="visible"
              className="text-sm sm:text-base text-off-white/60 mt-5 sm:mt-6 max-w-md leading-relaxed"
            >
              Premium football & cricket jerseys built for the culture.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={heroTextStagger}
              custom={2}
              initial="hidden"
              animate="visible"
              className="mt-8 sm:mt-10"
            >
              <Link
                href={ROUTES.SHOP}
                className="inline-flex items-center gap-3 bg-off-white text-navy px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-gold hover:text-navy transition-all duration-500 group"
              >
                Shop Collection
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