'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { ROUTES } from '@/lib/utils';

interface CategoryTileProps {
  name: string;
  slug: string;
  image: string;
  label?: string;
  description?: string;
}

export function CategoryTile({ name, slug, image, label, description }: CategoryTileProps) {
  const { ref, isInView } = useInView({ margin: '-60px' });
  const href = slug === 'football' ? ROUTES.FOOTBALL : slug === 'cricket' ? ROUTES.CRICKET : ROUTES.STREETWEAR;

  return (
    <Link href={href} className="group block relative overflow-hidden">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden"
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        {label && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-off-white/50 mb-2 font-medium">
            {label}
          </p>
        )}
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-off-white uppercase">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-off-white/50 mt-1.5">{description}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-off-white text-[11px] tracking-[0.15em] uppercase font-medium group-hover:gap-3 transition-all duration-300">
          Shop Now
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
