'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { fadeUpSmall, clipReveal, EASE_PREMIUM, DURATION } from '@/components/motion/motion-variants';
import { HoverArrow } from '@/components/motion/menu';

interface EditorialStoryCard {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  layout?: 'image-left' | 'image-right';
}

const STORIES: EditorialStoryCard[] = [
  {
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1200&q=85',
    imageAlt: 'HEADERR World Football 2026 campaign film',
    eyebrow: 'CAMPAIGN',
    title: 'WORLD FOOTBALL 2026',
    subtitle: 'The campaign film. Shot across three continents. Featuring the Player Version Brazil, Argentina, and France kits.',
    href: '/culture#editorials',
    ctaLabel: 'Watch Film',
    layout: 'image-left',
  },
  {
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=85',
    imageAlt: 'HEADERR IRL community in Mumbai',
    eyebrow: 'HEADERR IRL',
    title: 'REAL PEOPLE, REAL STORIES',
    subtitle: 'From Mumbai streets to Manchester stands. Community members wearing the culture every day.',
    href: '/culture#irl',
    ctaLabel: 'Read Stories',
    layout: 'image-right',
  },
];

export function CultureStory() {
  const shouldReduceMotion = useReducedMotion();
  const textDuration = shouldReduceMotion ? 0.01 : 0.7;

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-navy">
      <div className="text-center mb-16 sm:mb-20">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">
          Editorial
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-off-white">
          HEADERR CULTURE
        </h2>
        <p className="text-sm text-sage mt-4 max-w-2xl mx-auto">
          Stories from the intersection of sport, fashion, and identity.
        </p>
      </div>

      <div className="space-y-16 lg:space-y-24">
        {STORIES.map((story, index) => (
          <motion.div
            key={story.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              delay: index * 0.2,
              duration: 0.7,
              ease: EASE_PREMIUM,
            }}
            className={`relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${story.layout === 'image-right' ? 'lg:direction-rtl' : ''}`}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] lg:aspect-[3/2] overflow-hidden rounded-lg">
              <img
                src={story.image}
                alt={story.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-4 lg:p-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-3 font-medium">
                {story.eyebrow}
              </p>
              <motion.h3
                variants={clipReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                style={{
                  transitionDelay: shouldReduceMotion ? '0ms' : '200ms',
                  transitionDuration: shouldReduceMotion ? '0.01s' : '0.8s',
                }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-off-white leading-[0.95] uppercase"
              >
                {story.title}
              </motion.h3>
              <motion.p
                variants={fadeUpSmall}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                style={{
                  transitionDelay: shouldReduceMotion ? '0ms' : '400ms',
                  transitionDuration: `${textDuration}s`,
                }}
                className="text-base sm:text-lg text-sage mt-4 max-w-lg leading-relaxed"
              >
                {story.subtitle}
              </motion.p>
              <motion.div
                variants={fadeUpSmall}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                style={{
                  transitionDelay: shouldReduceMotion ? '0ms' : '600ms',
                  transitionDuration: `${textDuration}s`,
                }}
                className="mt-6"
              >
                <HoverArrow reducedMotion={shouldReduceMotion}>
                  <Link
                    href={story.href}
                    className="inline-flex items-center gap-2 text-gold text-[11px] tracking-[0.15em] uppercase font-medium hover:gap-3 hover:text-off-white transition-all duration-300"
                  >
                    {story.ctaLabel}
                    <svg className="w-3.5 h-3.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                  </Link>
                </HoverArrow>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}