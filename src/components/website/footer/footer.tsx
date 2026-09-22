'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Football', href: ROUTES.FOOTBALL },
      { label: 'Cricket', href: ROUTES.CRICKET },
      { label: 'New Drops', href: ROUTES.SHOP },
      { label: 'Master Edition', href: ROUTES.SHOP },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Shipping', href: '#' },
      { label: 'Returns', href: '#' },
      { label: 'Size Guide', href: '#' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'FAQ', href: '#' },
    ],
  },
];

const LEGAL = ['Privacy Policy', 'Terms', 'Shipping Policy', 'Refund Policy'];

export function Footer() {
  return (
    <footer className="relative bg-black text-off-white overflow-hidden">
      <div className="relative min-h-[72vh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.2, ease: EASE_PREMIUM }}
          className="flex-1 flex flex-col justify-end pt-24"
        >
          <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12">
            <p className="eyebrow text-off-white/40 mb-6">Built for the Game. Built for the Street.</p>
          </div>

          <div className="w-full select-none pointer-events-none">
            <motion.h2
              aria-hidden="true"
              initial={{ opacity: 0.25, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 1.4, ease: EASE_PREMIUM }}
              className="font-display text-[22vw] leading-none text-center whitespace-nowrap text-[#A8A8A8] translate-x-[2%]"
            >
              HEADERR
            </motion.h2>
          </div>
        </motion.div>

        {/* Nav columns */}
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-10 pt-16 pb-12">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono-meta text-[10px] text-off-white/40 mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-off-white/70 hover:text-red transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Legal row */}
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono-meta text-[10px] text-[#A8A8A8]">© 2026 HEADERR</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item}>
                <a href="#" className="font-mono-meta text-[10px] text-[#A8A8A8] hover:text-red transition-colors duration-200">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}