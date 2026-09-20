import Link from 'next/link';
import { ROUTES } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="bg-charcoal text-off-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-blood-red mb-4">SHOP</h4>
            <ul className="space-y-2">
              {['Football', 'Cricket', 'Streetwear', 'New Arrivals', 'Best Sellers', 'Sale'].map((item) => (
                <li key={item}>
                  <Link href={`${ROUTES.SHOP}?category=${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-off-white/70 hover:text-blood-red transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-blood-red mb-4">HELP</h4>
            <ul className="space-y-2">
              {['Contact', 'FAQ', 'Shipping', 'Returns', 'Size Guide'].map((item) => (
                <li key={item}>
                  <Link href={`/help/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-off-white/70 hover:text-blood-red transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-blood-red mb-4">ABOUT</h4>
            <ul className="space-y-2">
              {['Our Story', 'Instagram', 'Terms', 'Privacy'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-off-white/70 hover:text-blood-red transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-blood-red mb-4">NEWSLETTER</h4>
            <p className="text-sm text-off-white/70 mb-3">JOIN THE HEADERR WORLD.</p>
            <form
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-off-white/20 px-3 py-2 text-sm text-off-white placeholder:text-off-white/40 outline-none focus:border-blood-red"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blood-red text-off-white text-xs tracking-widest uppercase hover:bg-charcoal transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-off-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-off-white/40 tracking-wider uppercase">HEADERR © 2026 HEADERR INDIA / INR</p>
          <div className="flex gap-4">
            {['Instagram', 'Twitter', 'YouTube'].map((social) => (
              <a key={social} href="#" className="text-xs text-off-white/40 hover:text-blood-red transition-colors tracking-wider uppercase">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}