'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';

interface TaglineStripProps {
  text?: string;
}

export function TaglineStrip({ text }: TaglineStripProps) {
  const { ref, isInView } = useInView({ margin: '-100px' });

  const defaultText = 'From the pitch to the pavement. Jerseys built for identity, not just match day.';

  return (
    <section ref={ref} className="py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-y border-charcoal/8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-[1400px] mx-auto text-center"
      >
        <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-chrome font-medium leading-relaxed max-w-3xl mx-auto">
          {text || defaultText}
        </p>
      </motion.div>
    </section>
  );
}