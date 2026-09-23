'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

interface NSSettings { heading?: string; subheading?: string }

export function NewsletterSection({ settings }: { settings?: NSSettings | null }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const heading = settings?.heading ?? 'STAY IN';
  const sub = settings?.subheading ?? 'THE CULTURE.';
  const subText = 'New drops, campaign films, and community stories. Delivered to your inbox. No spam, ever.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setStatus('error'); return; }
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 800));
    setStatus('success');
    setEmail('');
  };

  return (
    <section id="newsletter" className="bg-charcoal py-20 sm:py-28">
      <div className="mx-auto max-w-[720px] px-6 sm:px-8 text-center relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: EASE_PREMIUM }}>
          <p className="eyebrow">The Drop List</p>
          <h2 className="headline text-4xl sm:text-5xl text-off-white mt-4 leading-[1.05]">{heading}<br /><em className="text-red not-italic">{sub}</em></h2>
          <p className="mt-6 text-base text-off-white/60 leading-relaxed max-w-md mx-auto">{subText}</p>
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="input flex-1" aria-label="Email address" disabled={status === 'loading' || status === 'success'} />
            <button type="submit" disabled={status === 'loading' || status === 'success'} className="btn-pill btn-pill-solid whitespace-nowrap">
              {status === 'loading' ? 'Subscribing…' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
          <p className={`mt-4 text-sm ${status === 'error' ? 'text-red' : 'text-off-white/50'}`} role={status === 'error' ? 'alert' : 'status'}>
            {status === 'error' ? 'Please enter a valid email address.' : ''}{status === 'success' ? 'Welcome to HEADERR. Check your inbox.' : ''}
          </p>
          <p className="mt-6 font-mono-meta text-[9px] text-off-white/40">Earliest access. Exclusive drops. The usual.</p>
        </motion.div>
      </div>
    </section>
  );
}
