import Link from 'next/link';

export function FeaturedDrop() {
  return (
    <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1600&q=80"
          alt="World Cup 2026"
          className="w-full h-full object-cover opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-lg">
            <p className="text-blood-red text-[10px] tracking-[0.3em] uppercase mb-4">FEATURED DROP</p>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wider uppercase text-off-white leading-none mb-4">
              WORLD FOOTBALL<br />26
            </h2>
            <p className="text-off-white/70 text-sm sm:text-lg tracking-wide mb-8">
              THE SHIRTS EVERYONE WILL BE TALKING ABOUT.
            </p>
            <Link
              href="/shop/football"
              className="inline-block px-8 py-3 bg-blood-red text-off-white text-xs tracking-widest uppercase hover:bg-charcoal transition-colors"
            >
              EXPLORE DROP
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}