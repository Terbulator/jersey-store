'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/utils';
import { FooterWordmark } from './footer-wordmark';

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
    title: 'Follow',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'Twitter', href: '#' },
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
];

export function Footer() {
  return (
    <footer className="relative bg-black text-off-white overflow-hidden">
      <div className="relative flex flex-col">
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
        </div>

        {/* Controlled negative space — reduced ~40% from previous flex-fill gap */}
        <div className="h-[36vh] sm:h-[26vh]" aria-hidden="true" />

        {/* Massive HEADERR wordmark — own full-width container, lower region */}
        <div className="relative z-[1] w-full select-none pointer-events-none overflow-hidden">
          <FooterWordmark />
        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="relative z-10 border-t border-[rgba(239,236,230,0.15)] bg-[#080808]">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 font-mono-meta text-[11px] tracking-[0.08em]">
            <p className="text-[#EFECE6]">© 2026 HEADERR</p>
            <ul className="sm:ml-auto flex flex-wrap gap-x-6 gap-y-2 text-[#A8A8A8]">
              {['Privacy Policy', 'Terms', 'Shipping Policy', 'Refund Policy'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-[#B3001B] transition-colors duration-200"
                  >
                    {item.toUpperCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}