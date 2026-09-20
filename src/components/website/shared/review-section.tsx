'use client';

import { Reveal, StaggerChildren, StaggerItem } from './reveal';

const REVIEWS = [
  {
    text: 'THE FIT IS INSANE.',
    detail: 'Player Version Brazil 2026. Feels like wearing the real thing.',
    author: 'ARJUN M.',
    product: 'Brazil 2026 — Player Version',
  },
  {
    text: 'QUALITY YOU CAN FEEL.',
    detail: 'Master Edition Real Madrid. The knit is premium, the badge is perfect.',
    author: 'PRIYA S.',
    product: 'Real Madrid 2026 — Master Edition',
  },
  {
    text: 'WEAR THE GAME.',
    detail: 'Ordered for match day, now I wear it everywhere. Culture piece.',
    author: 'RAHUL K.',
    product: 'Argentina 2026 — Player Version',
  },
];

export function ReviewSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <Reveal>
        <div className="text-center mb-14 sm:mb-18">
          <p className="text-[10px] tracking-[0.2em] uppercase text-blood-red mb-2 font-medium">
            What the community says
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            FOLLOW THE CULTURE.
          </h2>
        </div>
      </Reveal>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10" stagger={0.1}>
        {REVIEWS.map((review) => (
          <StaggerItem key={review.author}>
            <div className="group">
              <p className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="text-sm text-chrome mt-3 leading-relaxed">{review.detail}</p>
              <div className="mt-5 pt-4 border-t border-charcoal/8">
                <p className="text-[10px] tracking-[0.2em] uppercase font-medium">{review.author}</p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-chrome mt-1">{review.product}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
