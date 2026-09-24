'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';
import { createClient } from '@/lib/supabase/client';

interface HeroSettings {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  image_url?: string;
  desktop_image?: string;
  cta_text?: string;
  cta_url?: string;
}

const FALLBACK: HeroSettings = {
  eyebrow: 'VOL. 01 — THE 2026 SEASON',
  headline: 'WEAR THE GAME.',
  subheadline: 'Player-version football & cricket jerseys. Master-edition streetwear. Cut for the culture that never stops.',
  image_url: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=1600&q=80',
  cta_text: 'Shop the Drop',
  cta_url: ROUTES.SHOP,
};

export function SiteHero({ settings }: { settings?: HeroSettings | null }) {
  const [slide, setSlide] = useState<HeroSettings>(settings ?? FALLBACK);

  useEffect(() => {
    if (settings && settings.headline) { setSlide(settings); return; }
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from('promo_slides')
      .select('eyebrow, headline, subheadline, desktop_image, cta_text, cta_url')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .then(({ data }: { data: Array<{ eyebrow?: string | null; headline: string; subheadline?: string | null; desktop_image?: string | null; cta_text?: string | null; cta_url?: string | null }> | null }) => {
        if (cancelled || !data?.length) return;
        const s = data[0];
        if (s.headline) setSlide({
          eyebrow: s.eyebrow ?? '', headline: s.headline,
          subheadline: s.subheadline ?? '', desktop_image: s.desktop_image ?? '',
          cta_text: s.cta_text ?? '', cta_url: s.cta_url ?? '',
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [settings]);

  // Canonical image resolution: explicit desktop image first, then the
  // legacy image_url key (still present in older saved settings), then the
  // built-in fallback. Old content keeps working with no data migration.
  const heroImage = slide.desktop_image || slide.image_url || FALLBACK.image_url!;
  const headlineParts = (slide.headline ?? '').split('GAME.');
  const hasGameSplit = headlineParts.length > 1;
  const firstPart = hasGameSplit ? headlineParts[0] : slide.headline ?? '';
  const highlight = hasGameSplit ? headlineParts.join(' ').replace(firstPart, '').trim() : '';

  return (
    <section className="relative h-[100svh] min-h-[640px] bg-black overflow-hidden">
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE_PREMIUM }}
        className="absolute inset-0"
      >
        <Image
          src={heroImage}
          alt=""
          data-cms="image"
          fill
          className="object-cover opacity-50"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </motion.div>

      <div className="relative h-full flex flex-col justify-end max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pb-24 pt-40">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: EASE_PREMIUM }}
          className="max-w-3xl"
        >
          <p data-cms="eyebrow" className="font-mono-meta text-[10px] tracking-[0.35em] text-off-white/60 mb-6">
            {slide.eyebrow ?? FALLBACK.eyebrow}
          </p>
          <h1 data-cms="heading" data-sec-h style={{ color: 'var(--sec-heading, var(--th-text-inverse))' }} className="headline text-[52px] sm:text-[76px] lg:text-[104px] leading-[0.95] text-off-white">
            {firstPart}
            {hasGameSplit && (
              <>
                <br />
                <em style={{ color: 'var(--sec-accent, var(--th-brand-primary))' }} className="text-red not-italic underline underline-offset-[0.12em] decoration-[0.5px]">
                  {highlight}
                </em>
              </>
            )}
          </h1>
          <p data-cms="subheading" style={{ color: 'var(--sec-body, var(--th-text-inverse-soft))' }} className="mt-7 text-base sm:text-lg text-off-white/70 max-w-md leading-relaxed">
            {slide.subheadline ?? 'Player-version football & cricket jerseys. Master-edition streetwear. Cut for the culture that never stops.'}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={slide.cta_url ?? ROUTES.SHOP} data-cms="button" className="btn-pill btn-pill-solid">
              {slide.cta_text ?? 'Shop the Drop'}
            </Link>
            <Link href="/bundle" className="btn-pill btn-pill-outline">
              Bundle &amp; Save
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 right-6 sm:right-8 lg:right-12 hidden sm:flex flex-col items-center gap-3"
      >
        <span className="font-mono-meta text-[9px] text-off-white/40 tracking-[0.3em] [writing-mode:vertical-rl]">SCROLL</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="w-px h-12 bg-off-white/30 block" />
      </motion.div>
    </section>
  );
}
