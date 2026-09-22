'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { fadeUpSmall, clipReveal, EASE_PREMIUM, DURATION } from '@/components/motion/motion-variants';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const shouldReduceMotion = useReducedMotion();
  const { ref, isInView } = useInView({ margin: '-100px' });
  const textDuration = shouldReduceMotion ? 0.01 : 0.7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setStatus('success');
    setEmail('');
  };

  return (
    <section ref={ref} className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-deep-blue relative overflow-hidden">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--gold)_0%,_transparent_70%)] opacity-[0.03]" />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Label */}
        <motion.p
          variants={fadeUpSmall}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            transitionDelay: shouldReduceMotion ? '0ms' : '100ms',
            transitionDuration: `${textDuration}s`,
          }}
          className="text-[10px] tracking-[0.2em] uppercase text-gold mb-4 font-medium"
        >
          Newsletter
        </motion.p>

        {/* Headline with clip reveal */}
        <motion.h2
          variants={clipReveal}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            transitionDelay: shouldReduceMotion ? '0ms' : '300ms',
            transitionDuration: shouldReduceMotion ? '0.01s' : '0.8s',
          }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-off-white leading-[0.95] uppercase"
        >
          STAY IN THE CULTURE
        </motion.h2>

        {/* Supporting copy */}
        <motion.p
          variants={fadeUpSmall}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            transitionDelay: shouldReduceMotion ? '0ms' : '500ms',
            transitionDuration: `${textDuration}s`,
          }}
          className="text-base sm:text-lg text-sage mt-4 max-w-lg mx-auto leading-relaxed"
        >
          New drops, campaign films, and community stories. Delivered to your inbox.
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={fadeUpSmall}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            transitionDelay: shouldReduceMotion ? '0ms' : '700ms',
            transitionDuration: `${textDuration}s`,
          }}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input w-full text-center sm:text-left"
              aria-label="Email address"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="btn btn-primary whitespace-nowrap"
          >
            {status === 'loading' ? (
              'Subscribing...'
            ) : status === 'success' ? (
              'Subscribed!'
            ) : (
              'Subscribe'
            )}
          </button>
        </motion.form>

        {/* Status messages */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: status === 'error' || status === 'success' ? 1 : 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-4 text-sm ${status === 'error' ? 'text-red' : 'text-sage'}`}
        >
          {status === 'error' ? 'Please enter a valid email address.' : ''}
          {status === 'success' ? 'Thanks for subscribing. Welcome to HEADERR.' : ''}
        </motion.p>

        {/* Privacy note */}
        <motion.p
          variants={fadeUpSmall}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            transitionDelay: shouldReduceMotion ? '0ms' : '900ms',
            transitionDuration: `${textDuration}s`,
          }}
          className="mt-6 text-[10px] text-sage/50 tracking-wider"
        >
          No spam. Unsubscribe anytime.{' '}
          <a href="/privacy" className="underline hover:text-gold transition-colors">Privacy Policy</a>
        </motion.p>
      </div>
    </section>
  );
}