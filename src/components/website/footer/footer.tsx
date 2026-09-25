'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/utils';
import { FooterWordmark } from './footer-wordmark';
import type { NavItem } from '@/lib/storefront-types';
import { FOOTER_DEFAULTS, type FooterSettings } from '@/lib/site-chrome';

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

const FOOTER_SECTIONS = [
  { section: 'footer-shop', title: 'Shop' },
  { section: 'footer-support', title: 'Support' },
  { section: 'footer-follow', title: 'Follow' },
  { section: 'footer-about', title: 'About' },
];

export function Footer({ navItems, footer }: { navItems: NavItem[]; footer?: FooterSettings }) {
  const F = { ...FOOTER_DEFAULTS, ...footer };
  const columns = navItems.length
    ? FOOTER_SECTIONS.map((g) => ({
        title: g.title,
        links: navItems
          .filter((n) => n.section === g.section)
          .map((n) => ({ label: n.label, href: n.href })),
      })).filter((c) => c.links.length)
    : COLUMNS;

  return (
    <footer className="relative bg-black text-off-white" style={F.bg ? { background: F.bg } : undefined}>
      {/* Footer navigation — max-width centered container */}
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 lg:pt-24">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="headline text-2xl text-off-white">{F.logo_text}</p>
            {!!F.description && (
              <p className="mt-3 text-[13px] leading-relaxed text-[#A8A8A8]">{F.description}</p>
            )}
          </div>
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
            {columns.map((col) => (
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

      {/* Large editorial breathing space */}
      <div className="h-[40vh] sm:h-[30vh] lg:h-[35vh]" aria-hidden="true" />

      {/* Giant HEADERR wordmark — clipping container for reveal animation */}
      {F.show_wordmark && (
        <div className="relative w-full min-h-[22vw] sm:min-h-[26vw] lg:min-h-[22vw] flex items-end">
          <div className="w-full px-6 sm:px-8 lg:px-12 pb-8 sm:pb-12 lg:pb-14">
            <FooterWordmark />
          </div>
        </div>
      )}

      {/* Thin divider — full viewport width */}
      <div className="border-t border-[rgba(239,236,230,0.15)]" />

      {/* Legal bar — separate row, never overlaps wordmark */}
      <div className="relative bg-[#080808]">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 font-mono-meta text-[11px] tracking-[0.08em]">
            <p className="text-[#EFECE6]">{F.copyright}</p>
            <ul className="sm:ml-auto flex flex-wrap gap-x-6 gap-y-2 text-[#A8A8A8]">
              {F.legal.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-[#B3001B] transition-colors duration-200"
                  >
                    {item.label.toUpperCase()}
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