import Link from 'next/link';
import { ROUTES } from '@/lib/utils';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Shop All', href: ROUTES.SHOP },
      { label: 'Football', href: ROUTES.FOOTBALL },
      { label: 'Cricket', href: ROUTES.CRICKET },
      { label: 'Streetwear', href: ROUTES.STREETWEAR },
      { label: 'Bundle & Save', href: '/bundle' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Shipping', href: '#' },
      { label: 'Returns', href: '#' },
      { label: 'Size Guide', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    title: 'House',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Culture', href: '/culture' },
      { label: 'Account', href: ROUTES.ACCOUNT },
      { label: 'Search', href: ROUTES.SEARCH },
      { label: 'Wishlist', href: ROUTES.WISHLIST },
    ],
  },
];

const SOCIAL = ['Instagram', 'X', 'YouTube', 'TikTok'];

export function Footer() {
  return (
    <footer className="footer">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <p className="headline text-3xl text-off-white">HEADERR.</p>
            <p className="mt-4 text-sm text-off-white/50 max-w-[240px] leading-relaxed">
              Premium football &amp; cricket jerseys for the culture that never stops.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono-meta text-[10px] text-off-white/40 mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="font-mono-meta text-[10px] text-off-white/40 mb-4">Social</p>
            <ul className="space-y-2.5">
              {SOCIAL.map((s) => (
                <li key={s}>
                  <a href="#" className="link">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono-meta text-[9px] text-off-white/30">
            © 2026 HEADERR. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-mono-meta text-[9px] text-off-white/30">
              Free shipping over ₹999
            </span>
            <span className="font-mono-meta text-[9px] text-off-white/30">
              30-day returns
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}