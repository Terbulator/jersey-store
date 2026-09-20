'use client';

import Link from 'next/link';
import { Reveal, RevealImage } from './reveal';

const COMMUNITY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=600&q=80', alt: 'Football culture', size: 'large' },
  { src: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=600&q=80', alt: 'Cricket match day', size: 'small' },
  { src: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80', alt: 'Streetwear fit', size: 'small' },
  { src: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&q=80', alt: 'Match day energy', size: 'large' },
  { src: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80', alt: 'Jersey collection', size: 'small' },
  { src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80', alt: 'Football jersey', size: 'small' },
];

export function InstagramSection() {
  return (
    <section className="py-24 sm:py-32">
      <Reveal>
        <div className="text-center mb-12 sm:mb-16 px-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
            @headerr.in
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            FOLLOW THE CULTURE.
          </h2>
          <p className="text-sm text-chrome mt-3 max-w-md mx-auto">
            From the stands to the street. From match day to every day.
          </p>
        </div>
      </Reveal>

      {/* Editorial grid — varied sizes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 px-2 sm:px-3">
        {COMMUNITY_IMAGES.map((img, i) => (
          <RevealImage
            key={i}
            delay={i * 0.06}
            className={img.size === 'large' ? 'md:col-span-1 md:row-span-1' : ''}
          >
            <div className={`relative overflow-hidden group ${img.size === 'large' ? 'aspect-square' : 'aspect-square'}`}>
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-off-white text-[10px] tracking-[0.2em] uppercase font-medium">
                  @headerr.in
                </span>
              </div>
            </div>
          </RevealImage>
        ))}
      </div>

      <Reveal>
        <div className="text-center mt-10 sm:mt-14 px-6">
          <Link
            href="https://instagram.com/headerr.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal border-b border-charcoal/20 pb-1 hover:text-blood-red hover:border-blood-red/40 transition-all duration-300"
          >
            Follow @headerr.in
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
