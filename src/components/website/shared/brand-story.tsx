'use client';

import Link from 'next/link';
import { Reveal } from './reveal';
import { ROUTES } from '@/lib/utils';

export function BrandStory() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">
            Our Story
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            BORN FROM THE GAME.
            <br />
            BUILT FOR THE CULTURE.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm sm:text-base text-chrome mt-6 sm:mt-8 max-w-xl mx-auto leading-relaxed">
            HEADERR started with a simple belief: football and cricket jerseys
            deserve better. Better materials. Better design. Better culture.
            We make jerseys for people who wear the game as identity — not just on match day,
            but every day.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href={ROUTES.SHOP}
            className="inline-flex items-center gap-2 mt-8 sm:mt-10 text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal border-b border-charcoal/20 pb-1 hover:text-blood-red hover:border-blood-red/40 transition-all duration-300"
          >
            About HEADERR
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
