'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Football', href: ROUTES.FOOTBALL },
      { label: 'Cricket', href: ROUTES.CRICKET },
      { label: 'New Drops', href: ROUTES.SHOP },
      { label: 'Master Edition', href: ROUTES.SHOP },
      { label: 'Player Version', href: ROUTES.SHOP },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Shipping', href: '#' },
      { label: 'Returns', href: '#' },
      { label: 'Size Guide', href: '#' },
      { label: 'Order Tracking', href: '#' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'The Culture', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-black text-off-white overflow-hidden">
      <div className="relative min-h-[92vh] flex flex-col">
        {/* Small information at the top */}
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 lg:pt-24">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-8">
            {/* Utility / legal */}
            <div className="font-mono-meta text-[11px] leading-[1.7] tracking-[0.08em]">
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-[#A8A8A8] hover:text-[#B3001B] transition-colors duration-200">
                    Your Privacy Choices
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A8A8A8] hover:text-[#B3001B] transition-colors duration-200">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
              <p className="mt-5 text-[#EFECE6]">© 2026 HEADERR</p>
            </div>

            {/* Navigation — upper right */}
            <nav
              aria-label="Footer"
              className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-10 lg:gap-x-16"
            >
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <p className="font-mono-meta text-[11px] tracking-[0.08em] text-[#A8A8A8] mb-4">
                    {col.title}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[14px] text-[#EFECE6] hover:text-[#B3001B] transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Brand statement */}
          <p className="mt-14 lg:mt-16 font-mono-meta text-[14px] leading-[1.35] tracking-[0.08em] text-[#EFECE6] max-w-[340px]">
            More than a jersey.
            <br />
            A movement.
          </p>
        </div>

        {/* Large negative space */}
        <div className="flex-1" />

        {/* Massive HEADERR wordmark — cropped at the bottom edge */}
        <div className="w-[88vw] max-w-[1500px] mx-auto select-none pointer-events-none">
          <motion.h2
            aria-hidden="true"
            initial={{ opacity: 0.75, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 1.05, ease: EASE_EDITORIAL }}
            className="font-display text-[20vw] sm:text-[18vw] lg:text-[17vw] leading-[0.82] tracking-[-0.035em] whitespace-nowrap text-center text-[#A8A8A8] -mb-[0.18em]"
          >
            HEADERR
            <span
              aria-hidden="true"
              className="inline-block text-[0.15em] align-super leading-none translate-y-[0.15em]"
            >
              ®
            </span>
          </motion.h2>
        </div>
      </div>
    </footer>
  );
}