'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeroSlide {
  image: string;
  mobileImage: string;
  title: string;
  subtitle: string;
  primaryCTA: string;
  secondaryCTA: string;
  primaryHref: string;
  secondaryHref: string;
}

const slides: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1600&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80',
    title: 'THE NEW SEASON',
    subtitle: '2026 COLLECTION',
    primaryCTA: 'SHOP FOOTBALL',
    secondaryCTA: 'SHOP CRICKET',
    primaryHref: '/shop/football',
    secondaryHref: '/shop/cricket',
  },
  {
    image: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=1600&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=800&q=80',
    title: 'IPL DROPS',
    subtitle: 'LIVE NOW',
    primaryCTA: 'SHOP IPL',
    secondaryCTA: 'VIEW ALL',
    primaryHref: '/shop/cricket?team=ipl',
    secondaryHref: '/shop',
  },
  {
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    title: 'STREETWEAR',
    subtitle: 'THE EVERYDAY',
    primaryCTA: 'SHOP STREET',
    secondaryCTA: 'NEW ARRIVALS',
    primaryHref: '/shop/streetwear',
    secondaryHref: '/shop/new-arrivals',
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (i: number) => {
    setCurrent(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
  };

  const slide = slides[current];

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden bg-charcoal">
      {/* Desktop image */}
      <div className="absolute inset-0 hidden sm:block">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover opacity-60 transition-opacity duration-700"
          loading="eager"
        />
      </div>
      {/* Mobile image */}
      <div className="absolute inset-0 sm:hidden">
        <img
          src={slide.mobileImage}
          alt={slide.title}
          className="w-full h-full object-cover opacity-60 transition-opacity duration-700"
          loading="eager"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-blood-red text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4 animate-fade-in">
          {slide.subtitle}
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wider uppercase text-off-white leading-none animate-slide-up">
          {slide.title}
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-slide-up">
          <Link
            href={slide.primaryHref}
            onClick={() => goTo(current)}
            className="px-8 py-3 bg-blood-red text-off-white text-xs tracking-widest uppercase hover:bg-charcoal transition-colors"
          >
            {slide.primaryCTA}
          </Link>
          <Link
            href={slide.secondaryHref}
            onClick={() => goTo(current)}
            className="px-8 py-3 border border-off-white/40 text-off-white text-xs tracking-widest uppercase hover:bg-off-white hover:text-charcoal transition-colors"
          >
            {slide.secondaryCTA}
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === current ? 'bg-blood-red' : 'bg-off-white/40'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}