'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1600&q=85"
            alt="HEADERR about"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />
        </motion.div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 lg:pb-24">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-off-white/70 mb-4 sm:mb-5 font-medium"
              >
                About HEADERR
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95]"
              >
                THE GAME
                <br />
                DOESN&rsquo;T END
                <br />
                AT 90&rsquo;.
              </motion.h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">
                Our Philosophy
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-charcoal mb-8">
                Football is 90 minutes.
                <br />
                Culture is forever.
              </h2>
              <div className="space-y-6 text-chrome leading-relaxed">
                <p>
                  HEADERR was born at the intersection of sport, fashion, and identity.
                  We make what you wear after the final whistle — premium football and
                  cricket jerseys built for people who live the game, not just watch it.
                </p>
                <p>
                  Every piece carries official badges, premium materials, and culture-first
                  design. From the pitch to the pavement, from the stands to the street.
                </p>
<p>
                  We don&apos;t just sell jerseys. We build community. We tell stories. We
                  celebrate the culture that makes football and cricket more than sports
                  &mdash; they&apos;re a way of life.
                </p>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">
                What We Stand For
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blood-red/10 text-blood-red rounded-full text-sm font-bold">01</span>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-1">Authenticity First</h3>
                    <p className="text-chrome">Official badges, licensed products, real quality. No compromises.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blood-red/10 text-blood-red rounded-full text-sm font-bold">02</span>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-1">Culture Over Commerce</h3>
                    <p className="text-chrome">Community, stories, and identity drive every decision we make.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blood-red/10 text-blood-red rounded-full text-sm font-bold">03</span>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-1">Premium Without Pretension</h3>
                    <p className="text-chrome">Player Version performance, Master Edition craft, accessible prices.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blood-red/10 text-blood-red rounded-full text-sm font-bold">04</span>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-1">From Stands to Street</h3>
                    <p className="text-chrome">Jerseys built for 90 minutes, designed for the other 23 hours.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div className="p-6 border-t-2 border-blood-red">
            <p className="text-4xl sm:text-5xl font-bold text-charcoal tracking-tight">50+</p>
            <p className="text-sm text-chrome tracking-wide uppercase mt-1">Teams & Clubs</p>
          </div>
          <div className="p-6 border-t-2 border-blood-red">
            <p className="text-4xl sm:text-5xl font-bold text-charcoal tracking-tight">3</p>
            <p className="text-sm text-chrome tracking-wide uppercase mt-1">Edition Tiers</p>
          </div>
          <div className="p-6 border-t-2 border-blood-red">
            <p className="text-4xl sm:text-5xl font-bold text-charcoal tracking-tight">2026</p>
            <p className="text-sm text-chrome tracking-wide uppercase mt-1">Latest Season</p>
          </div>
          <div className="p-6 border-t-2 border-blood-red">
            <p className="text-4xl sm:text-5xl font-bold text-charcoal tracking-tight">100%</p>
            <p className="text-sm text-chrome tracking-wide uppercase mt-1">Authentic</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-20 text-center"
        >
          <Link
            href={ROUTES.SHOP}
            className="inline-flex items-center gap-3 bg-blood-red text-off-white px-8 py-4 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-charcoal transition-colors"
          >
            Shop the Collection
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}