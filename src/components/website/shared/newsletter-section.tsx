'use client';

import { useState } from 'react';
import { Reveal } from './reveal';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <div className="max-w-xl mx-auto text-center">
        <Reveal>
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-3 font-medium">
            Stay in the game
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            GET IN THE GAME.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm text-chrome mt-4 leading-relaxed">
            Be first to know about new drops, limited editions and HEADERR releases.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          {submitted ? (
            <p className="mt-8 text-sm text-blood-red font-medium tracking-wide">
              You&apos;re in. Welcome to HEADERR.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex gap-0 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                required
                className="flex-1 px-5 py-3.5 text-[11px] tracking-widest uppercase bg-transparent border border-charcoal/15 text-charcoal outline-none placeholder:text-chrome focus:border-charcoal/40 transition-colors duration-300"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-charcoal text-off-white text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-blood-red transition-colors duration-500 flex-shrink-0"
              >
                Join
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
