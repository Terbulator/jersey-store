'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { ref, isInView } = useInView({ margin: '-100px' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section ref={ref} className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto border-y border-charcoal/8">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-chrome font-medium mb-4">
            Stay in the game
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {submitted ? (
            <p className="text-sm text-blood-red font-medium tracking-wide">
              You&apos;re in. Welcome to HEADERR.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                required
                className="flex-1 px-5 py-3 text-[11px] tracking-widest uppercase bg-transparent border border-charcoal/15 text-charcoal outline-none placeholder:text-chrome focus:border-charcoal/40 transition-colors duration-300"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-charcoal text-off-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-blood-red transition-colors duration-500 flex-shrink-0 whitespace-nowrap"
              >
                Join
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}