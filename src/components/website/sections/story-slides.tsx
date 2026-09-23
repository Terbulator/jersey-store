'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '@/lib/storefront-types';
import { ROUTES } from '@/lib/utils';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;

const FALLBACK_FOOTBALL =
  'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=1400&q=80';
const FALLBACK_CRICKET =
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1400&q=80';

export function StorySlides({ categories }: { categories: Category[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const foot = categories[0];
  const cric = categories[1];

  const SLIDES = useMemo(
    () => [
      {
        id: 'football',
        code: '01',
        label: 'Football',
        headline: 'The game starts here.',
        sub: '',
        cta: 'Shop Football',
        href: ROUTES.FOOTBALL,
        image: (foot?.image ?? FALLBACK_FOOTBALL).replace('w=800', 'w=1400'),
      },
      {
        id: 'cricket',
        code: '02',
        label: 'Cricket',
        headline: 'Play different.',
        sub: '',
        cta: 'Shop Cricket',
        href: ROUTES.CRICKET,
        image: (cric?.image ?? FALLBACK_CRICKET).replace('w=800', 'w=1400'),
      },
      {
        id: 'player',
        code: '03',
        label: 'Player Version',
        headline: 'Built for the game.',
        sub: 'Player Version 25/26',
        cta: 'Explore Player Version',
        href: ROUTES.SHOP,
        image:
          'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1400&q=80',
      },
      {
        id: 'master',
        code: '04',
        label: 'Master Edition',
        headline: 'Master the details.',
        sub: '',
        cta: 'Explore Master Edition',
        href: ROUTES.SHOP,
        image:
          'https://images.unsplash.com/photo-1585591189603-d914a73ad1e1?w=1400&q=80',
      },
      {
        id: 'newdrop',
        code: '05',
        label: 'New Drop',
        headline: 'The new drop.',
        sub: '2026 Collection',
        cta: 'Shop New Drop',
        href: ROUTES.NEW_ARRIVALS,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400&q=80',
      },
    ],
    [foot?.image, cric?.image]
  );

  const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);
  const [active, setActive] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      setActive(clamp(Math.floor(v * SLIDES.length), 0, SLIDES.length - 1));
    });
  }, [scrollYProgress, SLIDES.length]);

  const slide = SLIDES[active];

  return (
    <section
      ref={sectionRef}
      aria-label="Editions story"
      className="relative h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {SLIDES.map((s, i) => (
          <motion.div
            key={s.id}
            aria-hidden={i !== active}
            className="absolute inset-0"
            animate={
              reduce
                ? { opacity: i === active ? 1 : 0 }
                : { opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.05 }
            }
            transition={{ duration: reduce ? 0 : 0.9, ease: EASE_EDITORIAL }}
          >
            <img
              src={s.image}
              alt={s.label}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding={i === 0 ? 'sync' : 'async'}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          </motion.div>
        ))}

        <div
          className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-8 lg:px-12 pb-24 sm:pb-28 lg:pb-24"
        >
          <motion.div
            key={active}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: reduce ? undefined : EASE_EDITORIAL }}
            className="max-w-[640px]"
          >
            <p className="font-mono-meta text-[11px] tracking-[0.3em] text-[#B3001B] mb-4 sm:mb-5">
              {slide.code} — {slide.label.toUpperCase()}
            </p>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#EFECE6]">
              {slide.headline}
            </h2>
            {slide.sub && (
              <p className="mt-4 font-mono-meta text-[11px] sm:text-[12px] tracking-[0.2em] text-[#A8A8A8]">
                {slide.sub.toUpperCase()}
              </p>
            )}
            <Link
              href={slide.href}
              className="group mt-8 sm:mt-10 inline-flex items-center gap-2 border border-[rgba(239,236,230,0.2)] hover:border-[#B3001B] px-6 py-3 font-mono-meta text-[11px] tracking-[0.15em] text-[#EFECE6] hover:text-[#B3001B] transition-colors duration-300"
            >
              {slide.cta}
              <ArrowUpRight
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 right-0 z-10 pb-6 pr-6 sm:pb-8 sm:pr-8 lg:pb-8 lg:pr-12 flex items-center gap-4">
          <div className="w-24 sm:w-32 h-px bg-[rgba(239,236,230,0.25)] relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#B3001B]"
              animate={{ width: `${((active + 1) / SLIDES.length) * 100}%` }}
              transition={{ duration: 0.4, ease: EASE_PREMIUM }}
            />
          </div>
          <p className="font-mono-meta text-[11px] tracking-[0.2em] text-[#EFECE6]">
            <span className="text-[#B3001B]">
              {String(active + 1).padStart(2, '0')}
            </span>{' '}
            / {String(SLIDES.length).padStart(2, '0')}
          </p>
        </div>
      </div>
    </section>
  );
}