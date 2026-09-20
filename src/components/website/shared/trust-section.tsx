import Link from 'next/link';
import { ROUTES } from '@/lib/utils';

const TRUST_ITEMS = [
  { label: 'PREMIUM MATERIALS', desc: 'High-quality fabrics & prints' },
  { label: 'QUALITY PRINTING', desc: 'Vibrant, durable designs' },
  { label: 'CAREFULLY PACKED', desc: 'Protected for shipping' },
  { label: 'DELIVERED ACROSS INDIA', desc: 'Fast & reliable delivery' },
];

export function TrustSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-charcoal/10">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xs tracking-widest uppercase text-blood-red text-center mb-8">BUILT FOR THE CULTURE.</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="text-center">
              <h4 className="text-xs tracking-widest uppercase text-charcoal mb-1">{item.label}</h4>
              <p className="text-xs text-chrome">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}