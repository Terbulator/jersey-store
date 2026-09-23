'use client';

import { motion } from 'framer-motion';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

const DEFAULT_STATS = [
  { value: '12K+', label: 'Jerseys shipped' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '30', label: 'Day returns' },
  { value: '0', label: 'Knock-offs. Ever.' },
];

interface SSSettings { stats?: { value: string; label: string }[] }

export function StatsSection({ settings }: { settings?: SSSettings | null }) {
  const stats = settings?.stats ?? DEFAULT_STATS;
  return (
    <section className="bg-black py-16 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.08, duration: 0.6, ease: EASE_PREMIUM }} className="text-center lg:text-left">
            <p className="headline text-4xl sm:text-5xl text-off-white">{stat.value}</p>
            <p className="font-mono-meta text-[10px] text-off-white/50 mt-2 tracking-[0.15em] uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
