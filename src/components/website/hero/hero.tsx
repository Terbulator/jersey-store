'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=1600&q=85"
          alt="Football culture"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </motion.div>

      {/* Content — bottom-left aligned */}
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-2xl">
            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-off-white/70 mb-4 sm:mb-5 font-medium"
            >
              2026 Collection
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95]"
            >
              WEAR
              <br />
              THE GAME.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-sm sm:text-base text-off-white/60 mt-5 sm:mt-6 max-w-md leading-relaxed"
            >
              Premium football &amp; cricket jerseys built for the culture.
              <br className="hidden sm:block" />
              From the stands to the street.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 sm:mt-10"
            >
              <Link
                href={ROUTES.SHOP}
                className="inline-flex items-center gap-3 bg-off-white text-charcoal px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-blood-red hover:text-off-white transition-all duration-500 group"
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

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-8 bg-off-white/30"
        />
      </motion.div>
    </section>
  );
}
