'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CategoryTileProps {
  name: string;
  slug: string;
  image: string;
  label: string;
  description: string;
}

export function CategoryTile({ name, slug, image, label, description }: CategoryTileProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/shop/${slug}`}
      className="group relative block h-[60vh] sm:h-[70vh] overflow-hidden bg-charcoal"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 img-zoom">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <p className="text-blood-red text-[10px] tracking-[0.3em] uppercase mb-2">{label}</p>
        <h3 className="text-3xl sm:text-5xl font-bold tracking-wider uppercase text-off-white mb-2">
          {name}
        </h3>
        <p className="text-off-white/60 text-sm tracking-wide mb-4">{description}</p>
        <span className={cn(
          'inline-flex items-center gap-2 text-xs tracking-widest uppercase text-off-white border-b border-off-white/40 pb-1 transition-all',
          hovered ? 'border-blood-red text-blood-red' : ''
        )}>
          SHOP {name}
          <svg className={cn(
            'w-4 h-4 transition-transform',
            hovered ? 'translate-x-1' : ''
          )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}