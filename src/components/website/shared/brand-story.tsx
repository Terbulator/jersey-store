import Link from 'next/link';

export function BrandStory() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-xs tracking-widest uppercase text-blood-red mb-4">OUR STORY</h2>
        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal mb-6">
          BORN FROM THE GAME.<br />BUILT FOR THE CULTURE.
        </h3>
        <p className="text-charcoal/70 text-sm sm:text-base tracking-wide leading-relaxed mb-8">
          HEADERR exists at the intersection of football, cricket, and streetwear.
          We design for the culture that lives and breathes sport.
        </p>
        <Link
          href="/about"
          className="inline-block px-8 py-3 border border-charcoal text-charcoal text-xs tracking-widest uppercase hover:bg-charcoal hover:text-off-white transition-colors"
        >
          ABOUT HEADERR →
        </Link>
      </div>
    </section>
  );
}