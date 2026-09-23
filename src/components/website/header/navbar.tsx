'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUiStore } from '@/store/ui-store';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/storefront-types';
import { HEADER_DEFAULTS, type HeaderSettings } from '@/lib/site-chrome';

const FALLBACK_NAV = [
  { label: 'Shop', href: ROUTES.SHOP },
  { label: 'Football', href: ROUTES.FOOTBALL },
  { label: 'Cricket', href: ROUTES.CRICKET },
  { label: 'Streetwear', href: ROUTES.STREETWEAR },
  { label: 'Bundle', href: '/bundle' },
  { label: 'About', href: '/about' },
];

export function Navbar({ navItems, header }: { navItems: NavItem[]; header?: HeaderSettings }) {
  const H = { ...HEADER_DEFAULTS, ...header };
  const main = navItems.filter((n) => n.section === 'main');
  const NAV = main.length
    ? main.map((n) => ({ label: n.label, href: n.href }))
    : FALLBACK_NAV;
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const wishlistCount = useWishlistStore((s) => s.items).length;
  const { user, firstName } = useAuth();
  const { setMenuOpen, setSearchOpen } = useUiStore();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          H.sticky ? 'header-shell fixed top-9 left-0 right-0 z-40' : 'header-shell sticky top-0 left-0 right-0 z-40',
          scrolled ? 'scrolled' : ''
        )}
        style={{
          height: scrolled ? 60 : 72,
          transition: 'height 0.35s ease',
          background: scrolled ? H.bg || undefined : H.transparent_top ? 'transparent' : H.bg || undefined,
        }}
      >
        <div className="mx-auto max-w-[1400px] h-full px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            {H.logo ? (
              <img src={H.logo} alt={H.logo_text} style={{ height: H.logo_size }} className="w-auto" />
            ) : (
              <span className="headline text-off-white leading-none tracking-tight" style={{ fontSize: H.logo_size }}>
                {H.logo_text}
              </span>
            )}
            {!!H.tagline && (
              <span className="hidden md:inline font-mono-meta text-[9px] text-off-white/40 pt-1">
                {H.tagline}
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-8" style={{ gap: H.nav_gap }}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={H.link_color ? { color: H.link_color } : undefined}
                className="font-mono-meta text-[10px] text-off-white/70 hover:text-off-white transition-colors py-2 relative group"
              >
                {item.label}
                <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-off-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            {H.show_search && (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-off-white/70 hover:text-off-white transition-colors"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            )}
            {H.show_account && (
              <Link
                href={user ? ROUTES.ACCOUNT : ROUTES.LOGIN}
                aria-label="Account"
                className="hidden sm:flex items-center gap-2 p-2 text-off-white/70 hover:text-off-white transition-colors"
              >
                {firstName && (
                  <span className="hidden xl:inline font-mono-meta text-[9px] text-off-white/50">
                    Hi, {firstName}
                  </span>
                )}
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
            )}
            {H.show_wishlist && (
              <Link
                href={ROUTES.WISHLIST}
                aria-label="Wishlist"
                className="relative hidden sm:flex p-2 text-off-white/70 hover:text-off-white transition-colors"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B3001B] text-off-white text-[9px] font-medium flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            {H.show_cart && (
              <button
                onClick={() => useCartStore.getState().openCart()}
                aria-label="Cart"
                className="relative p-2 text-off-white/70 hover:text-off-white transition-colors"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-off-white text-[9px] font-medium flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 text-off-white/70 hover:text-off-white transition-colors"
            >
              <Menu className="w-[20px] h-[20px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}