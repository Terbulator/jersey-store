'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { useAuth } from '@/components/auth/auth-provider';
import { useCartStore } from '@/store/cart-store';
import type { NavItem } from '@/lib/storefront-types';
import type { HeaderSettings } from '@/lib/site-chrome';

const FALLBACK_LINKS = [
  { label: 'Shop All', href: ROUTES.SHOP },
  { label: 'Football', href: ROUTES.FOOTBALL },
  { label: 'Cricket', href: ROUTES.CRICKET },
  { label: 'Streetwear', href: ROUTES.STREETWEAR },
  { label: 'Bundle & Save', href: '/bundle' },
  { label: 'About', href: '/about' },
  { label: 'Culture', href: '/culture' },
  { label: 'Account', href: ROUTES.ACCOUNT },
];

export function MobileMenu({ navItems, header }: { navItems: NavItem[]; header?: HeaderSettings }) {
  const logoText = header?.logo_text || 'HEADERR.';
  const links = navItems.filter((n) => n.section === 'mobile');
  const { menuOpen, setMenuOpen } = useUiStore();
  const { user } = useAuth();

  // Authentication-critical destinations must never depend on CMS content:
  // a CMS edit that drops the Account item would otherwise remove the only
  // mobile entry point to login/signup (the header account icon is hidden
  // below the sm breakpoint). Preserve CMS links in order, but always
  // guarantee a working Account + Create Account entry.
  const accountHref = user ? ROUTES.ACCOUNT : ROUTES.LOGIN;
  const base = links.length
    ? links.map((n) => ({ label: n.label, href: n.href }))
    : FALLBACK_LINKS.map((l) => ({ ...l }));
  const normalized = base.map((l) =>
    l.href === ROUTES.ACCOUNT || l.href === ROUTES.LOGIN ? { ...l, href: accountHref } : l
  );
  const hasAccount = normalized.some(
    (l) => l.href === accountHref || l.label.trim().toLowerCase() === 'account'
  );
  const hasSignup = normalized.some(
    (l) => l.href === ROUTES.SIGNUP || l.label.trim().toLowerCase() === 'create account'
  );
  const LINKS = [
    ...normalized,
    ...(hasAccount ? [] : [{ label: 'Account', href: accountHref }]),
    ...(hasSignup ? [] : [{ label: 'Create Account', href: ROUTES.SIGNUP }]),
  ];

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-black flex flex-col"
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
            {header?.logo ? (
              <img src={header.logo} alt={logoText} className="h-6 w-auto" />
            ) : (
              <span className="headline text-xl text-off-white">{logoText}</span>
            )}
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 text-off-white/70 hover:text-off-white"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center px-8 overflow-y-auto py-8">
            {LINKS.map((link, i) => (
              <motion.div
                key={`${link.label}-${link.href}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="headline text-[34px] sm:text-[40px] text-off-white hover:text-red transition-colors py-2 block min-h-[44px]"
                >
                  <span className="font-mono-meta text-[10px] text-off-white/40 mr-4 align-middle">
                    0{i + 1}
                  </span>
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="px-8 py-6 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono-meta text-[10px] text-off-white/40">HEADERR. EST. 2026</span>
            <button
              onClick={() => {
                setMenuOpen(false);
                useCartStore.getState().openCart();
              }}
              className="btn-pill btn-pill-solid"
            >
              Your Bag
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}