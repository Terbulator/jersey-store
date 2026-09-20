export function NewsletterSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-charcoal">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-xs tracking-widest uppercase text-blood-red mb-2">JOIN THE HEADERR WORLD</h2>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase text-off-white mb-4">
          GET THE LATEST DROPS
        </h3>
        <p className="text-off-white/60 text-sm mb-6">
          Exclusive releases, early access, and culture updates.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 bg-white/10 border border-off-white/20 text-off-white placeholder:text-off-white/40 outline-none focus:border-blood-red text-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blood-red text-off-white text-xs tracking-widest uppercase hover:bg-charcoal transition-colors"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
    </section>
  );
}