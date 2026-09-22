'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { fadeUpSmall, EASE_PREMIUM } from '@/components/motion/motion-variants';
import { ROUTES } from '@/lib/utils';

const FOOTER_LINKS = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'Football', href: ROUTES.FOOTBALL },
      { label: 'Cricket', href: ROUTES.CRICKET },
      { label: 'Streetwear', href: ROUTES.STREETWEAR },
      { label: 'New Arrivals', href: `${ROUTES.SHOP}?sort=newest` },
      { label: 'Best Sellers', href: `${ROUTES.SHOP}?sort=best-selling` },
      { label: 'Player Version', href: `${ROUTES.SHOP}?edition=player` },
    ],
  },
  help: {
    title: 'Help',
    links: [
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Contact', href: '/contact' },
      { label: 'Order Tracking', href: '/account/orders' },
    ],
  },
  about: {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Culture', href: '/culture' },
      { label: 'Instagram', href: 'https://instagram.com/headerr.in', external: true },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="footer border-t border-olive/20 bg-navy">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0"
          >
            <Link href={ROUTES.HOME} className="text-base font-bold tracking-[0.25em] uppercase text-off-white">
              HEADERR
            </Link>
            <p className="text-[11px] text-sage/60 mt-2 leading-relaxed max-w-[200px]">
              Premium football & cricket jerseys. Built for the culture.
            </p>
          </motion.div>

          {/* Link columns */}
          {Object.values(FOOTER_LINKS).map((col, colIdx) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (colIdx + 1) * 0.08, duration: 0.6, ease: EASE_PREMIUM }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium text-gold mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...('external' in link && link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-[12px] text-sage/70 hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-olive/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] text-sage/50 tracking-wider"
          >
            &copy; 2026 HEADERR INDIA. ALL RIGHTS RESERVED.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <Link
              href="https://instagram.com/headerr.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-sage/50 hover:text-gold tracking-wider transition-colors duration-200"
            >
              INSTAGRAM
            </Link>
            <Link
              href="https://twitter.com/headerr_in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-sage/50 hover:text-gold tracking-wider transition-colors duration-200"
            >
              TWITTER
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}