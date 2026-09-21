'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

interface EditorialCardProps {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  href: string;
  ctaLabel?: string;
  className?: string;
}

function EditorialCard({
  image,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  href,
  ctaLabel = 'Read More',
  className,
}: EditorialCardProps) {
  const { ref, isInView } = useInView({ margin: '-80px' });

  return (
    <Link href={href} className={cn('group block relative overflow-hidden', className)}>
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="aspect-[4/5] overflow-hidden"
        >
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />
        </motion.div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-off-white/50 mb-2 font-medium">
          {eyebrow}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-off-white leading-tight mb-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-off-white/50 mb-4 max-w-xs leading-relaxed">{subtitle}</p>
        )}
        <div className="inline-flex items-center gap-2 text-off-white text-[11px] tracking-[0.15em] uppercase font-medium group-hover:gap-3 transition-all duration-300">
          {ctaLabel}
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

interface EditorialTeaserProps {
  cards: Array<{
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
    href: string;
    ctaLabel?: string;
  }>;
  title?: string;
  subtitle?: string;
}

export function EditorialTeaser({
  cards,
  title = 'HEADERR JOURNAL',
  subtitle = 'Culture, campaigns & community stories',
}: EditorialTeaserProps) {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
          Editorial
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-chrome mt-3 max-w-md mx-auto">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <EditorialCard
              image={card.image}
              imageAlt={card.imageAlt}
              eyebrow={card.eyebrow}
              title={card.title}
              subtitle={card.subtitle}
              href={card.href}
              ctaLabel={card.ctaLabel}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}