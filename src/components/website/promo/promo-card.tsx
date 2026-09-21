'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

interface PromoCardProps {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  className?: string;
}

export function PromoCard({
  image,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  href,
  ctaLabel = 'Shop Now',
  aspectRatio = 'portrait',
  className,
}: PromoCardProps) {
  const { ref, isInView } = useInView({ margin: '-60px' });

  const aspectClass = cn(
    'overflow-hidden',
    aspectRatio === 'portrait' && 'aspect-[4/5]',
    aspectRatio === 'landscape' && 'aspect-[3/2]',
    aspectRatio === 'square' && 'aspect-square'
  );

  return (
    <Link href={href} className={cn('group block relative', className)}>
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className={aspectClass}
        >
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        </motion.div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        {eyebrow && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-off-white/50 mb-2 font-medium">
            {eyebrow}
          </p>
        )}
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-off-white uppercase leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-off-white/50 mt-1.5 max-w-xs">{subtitle}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-off-white text-[11px] tracking-[0.15em] uppercase font-medium group-hover:gap-3 transition-all duration-300">
          {ctaLabel}
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </div>
      </div>
    </Link>
  );
}