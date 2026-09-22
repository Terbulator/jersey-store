'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Shop', href: ROUTES.SHOP },
  { label: 'Football', href: ROUTES.FOOTBALL },
  { label: 'Cricket', href: ROUTES.CRICKET },
  { label: 'Streetwear', href: ROUTES.STREETWEAR },
  { label: 'Bundle', href: '/bundle' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
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
          'header-shell fixed top-9 left-0 right-0 z-40',
          scrolled ? 'scrolled' : ''
        )}
        style={{ height: scrolled ? 60 : 72, transition: 'height 0.35s ease' }}
      >
        <div className="mx-auto max-w-[1400px] h-full px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <span className="headline text-[22px] text-off-white leading-none tracking-tight">
              HEADERR.
            </span>
            <span className="hidden md:inline font-mono-meta text-[9px] text-off-white/40 pt-1">
              EST. 2026
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono-meta text-[10px] text-off-white/70 hover:text-off-white transition-colors py-2 relative group"
              >
                {item.label}
                <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-off-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-2 text-off-white/70 hover:text-off-white transition-colors"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <Link
              href={ROUTES.ACCOUNT}
              aria-label="Account"
              className="hidden sm:flex p-2 text-off-white/70 hover:text-off-white transition-colors"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href={ROUTES.WISHLIST}
              aria-label="Wishlist"
              className="hidden sm:flex p-2 text-off-white/70 hover:text-off-white transition-colors"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>
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