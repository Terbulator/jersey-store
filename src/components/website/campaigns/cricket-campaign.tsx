'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { ROUTES } from '@/lib/utils';
import { imageReveal, clipReveal, fadeUpSmall, EASE_PREMIUM, DURATION } from '@/components/motion/motion-variants';
import { HoverArrow } from '@/components/motion/menu';

export function CricketCampaign() {
  const shouldReduceMotion = useReducedMotion();
  const { ref, isInView } = useInView({ margin: '-100px' });

  const imageDuration = shouldReduceMotion ? 0.01 : DURATION.hero;
  const textDuration = shouldReduceMotion ? 0.01 : 0.7;

  return (
    <section ref={ref} className="relative min-h-[70vh] sm:min-h-[80vh] overflow-hidden bg-deep-blue">
      {/* Split composition: Image on right, text on left */}
      <div className="absolute inset-0 flex">
        {/* Text side - left */}
        <div className="relative w-1/2 lg:w-[55%] flex items-center p-6 sm:p-8 lg:p-12">
          <div className="max-w-xl">
            {/* Label */}
            <motion.p
              variants={fadeUpSmall}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '200ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="text-[10px] tracking-[0.2em] uppercase text-sage mb-4 font-medium"
            >
              Cricket Campaign
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
              <span>CRICKET</span>
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
              className="text-base sm:text-lg text-off-white/70 mt-6 max-w-lg leading-relaxed"
            >
              IPL franchises. International sides. Player Version & Master Edition.
              The sound of leather on willow, worn beyond the boundary.
            </motion.p>

            {/* Metadata */}
            <motion.div
              variants={fadeUpSmall}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '700ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="mt-8 flex flex-wrap gap-3 text-[10px] tracking-[0.15em] uppercase text-sage/70"
            >
              <span>PLAYER VERSION</span>
              <span className="text-olive/50">·</span>
              <span>MASTER EDITION</span>
              <span className="text-olive/50">·</span>
              <span>IPL FRANCHISES</span>
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUpSmall}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                transitionDelay: shouldReduceMotion ? '0ms' : '800ms',
                transitionDuration: `${textDuration}s`,
              }}
              className="mt-10"
            >
              <HoverArrow reducedMotion={shouldReduceMotion}>
                <Link
                  href={ROUTES.CRICKET}
                  className="inline-flex items-center gap-2 bg-sage text-navy px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-olive hover:text-navy transition-all duration-500 group"
                >
                  Shop Cricket
                  <svg className="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </Link>
              </HoverArrow>
            </motion.div>
          </div>
        </div>

        {/* Image side - right */}
        <motion.div
          variants={imageReveal}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            transitionDuration: `${imageDuration}s`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="relative w-1/2 lg:w-[45%] hidden lg:block"
        >
          <img
            src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=85"
            alt="HEADERR Cricket campaign - International kit"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-deep-blue/80 via-deep-blue/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}