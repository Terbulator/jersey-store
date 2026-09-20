export const metadata = { title: 'Page Not Found | HEADERR' };

export default function NotFound() {
  return (
    <section className="py-24 px-4 text-center">
      <h1 className="text-6xl font-bold text-charcoal mb-4">404</h1>
      <p className="text-sm text-chrome mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="inline-block px-8 py-3 bg-blood-red text-off-white text-xs tracking-widest uppercase hover:bg-charcoal transition-colors">
        GO HOME
      </a>
    </section>
  );
}