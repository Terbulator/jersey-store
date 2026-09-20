'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { ROUTES } from '@/lib/utils';

export function FeaturedDrop() {
  const { ref, isInView } = useInView({ margin: '-100px' });

  return (
    <section ref={ref} className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
      {/* Background image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.06 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1400&q=85"
          alt="World Cup 2026 collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </motion.div>

      {/* Content — bottom aligned */}
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12 pb-14 sm:pb-18 lg:pb-20">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[10px] tracking-[0.25em] uppercase text-blood-red mb-3 font-medium"
            >
              Featured Drop
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-off-white leading-[0.95]"
            >
              WORLD FOOTBALL
              <br />
              2026
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-sm text-off-white/50 mt-4 max-w-sm leading-relaxed"
            >
              Player Version jerseys. Premium materials. Official team badges.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="mt-6"
            >
              <Link
                href={`${ROUTES.FOOTBALL}?edition=player`}
                className="inline-flex items-center gap-2 text-off-white text-[11px] tracking-[0.2em] uppercase font-medium border-b border-off-white/30 pb-1 hover:border-off-white transition-colors duration-300"
              >
                Shop Football
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
