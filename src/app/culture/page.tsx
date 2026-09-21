'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';

export default function CulturePage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85"
            alt="HEADERR community match day"
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
                Culture
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-off-white leading-[0.95]"
              >
                MORE THAN
                <br />
                A JERSEY.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-sm sm:text-base text-off-white/60 mt-5 sm:mt-6 max-w-md leading-relaxed"
              >
                Football is 90 minutes. Culture is forever. HEADERR exists at the
                intersection of sport, fashion, and identity.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
        {/* Our Story */}
        <div id="journal" className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-3 font-medium">
              Our Story
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
              HEADERR Journal
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <article className="group relative overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&q=85"
                alt="HEADERR editorial campaign"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  Editorial
                </p>
                <h3 className="text-xl font-bold text-white mb-2">The Game Doesn&apos;t End at 90&apos;</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  Read More
                </Link>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85"
                alt="HEADERR IRL community"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  HEADERR IRL
                </p>
                <h3 className="text-xl font-bold text-white mb-2">Real People, Real Stories</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  Read More
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* Community */}
        <div id="matchday" className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-3 font-medium">
              Community
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
              Match Day & Follow the Culture
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <article className="group relative overflow-hidden rounded-lg aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85"
                alt="HEADERR match day community"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  Match Day
                </p>
                <h3 className="text-lg font-bold text-white mb-2">Stories from the Stands</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  View All
                </Link>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-lg aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&q=85"
                alt="HEADERR follow the culture"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  Follow the Culture
                </p>
                <h3 className="text-lg font-bold text-white mb-2">Community in Action</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  View All
                </Link>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-lg aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85"
                alt="HEADERR IRL community"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  HEADERR IRL
                </p>
                <h3 className="text-lg font-bold text-white mb-2">Real People</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  View All
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* Editorial */}
        <div id="editorials" className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-3 font-medium">
              Editorial
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
              Campaigns & Stories
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <article className="group relative overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&q=85"
                alt="HEADERR campaign"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  Campaign
                </p>
                <h3 className="text-xl font-bold text-white mb-2">World Football 2026</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  View Campaign
                </Link>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=800&q=85"
                alt="HEADERR football culture"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                  Editorial
                </p>
                <h3 className="text-xl font-bold text-white mb-2">The Beautiful Game</h3>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-off-white text-[10px] tracking-[0.15em] uppercase font-medium hover:gap-2.5 transition-all duration-200"
                >
                  View Editorial
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center pt-12 border-t border-charcoal/10"
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-3 font-medium">
            Join the Culture
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-charcoal mb-6">Stay Connected</h3>
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-2 bg-blood-red text-off-white px-6 py-3 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-charcoal transition-colors"
          >
            Subscribe to HEADERR Journal
          </Link>
        </motion.div>
      </section>
    </div>
  );
}