'use client';

import { Reveal, RevealLine } from './reveal';

const TRUST_ITEMS = [
  { label: 'PREMIUM MATERIALS', description: 'Recycled polyester, heavy cotton, breathable knit.' },
  { label: 'QUALITY PRINTING', description: 'Sublimation print that won\'t fade or crack.' },
  { label: 'CAREFULLY PACKED', description: 'Each jersey packed with care for delivery.' },
  { label: 'DELIVERED ACROSS INDIA', description: 'Free shipping on orders above ₹999.' },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto">
      <RevealLine className="mb-12" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
        {TRUST_ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.08}>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal font-medium mb-2">
                {item.label}
              </p>
              <p className="text-xs text-chrome leading-relaxed">{item.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <RevealLine className="mt-12" />
    </section>
  );
}
