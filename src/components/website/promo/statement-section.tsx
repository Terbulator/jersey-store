'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { ROUTES } from '@/lib/utils';

export function StatementSection() {
  const { ref, isInView } = useInView({ margin: '-100px' });

  return (
    <section ref={ref} className="relative h-[70vh] sm:h-[80vh] min-h-[500px] overflow-hidden">
      {/* Full-width background image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1600&q=85"
          alt="HEADERR brand statement - Football culture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      </motion.div>

      {/* Statement copy overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">
                HEADERR Statement
              </p>
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95]">
                THE GAME
                <br />
                DOESN&rsquo;T END
                <br />
                AT 90&rsquo;.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8"
            >
              <p className="text-base sm:text-lg text-off-white/70 max-w-lg leading-relaxed">
                Football is 90 minutes. Culture is forever. HEADERR exists at the
                intersection of sport, fashion, and identity. We make what you wear
                after the final whistle.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-10"
            >
              <a
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
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}