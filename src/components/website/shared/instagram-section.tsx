export function InstagramSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xs tracking-widest uppercase text-blood-red mb-2">FOLLOW THE CULTURE</h2>
          <p className="text-sm text-chrome">@HEADERR.IN</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-charcoal/5 img-zoom">
              <img
                src={`https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80&random=${i}`}
                alt={`HEADERR Instagram post ${i}`}
                className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://instagram.com/headerr.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-blood-red transition-colors"
          >
            FOLLOW @HEADERR.IN →
          </a>
        </div>
      </div>
    </section>
  );
}