'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { SearchOverlay } from '../search/search-overlay';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { useCartStore } from '@/store/cart-store';
import { ROUTES, cn } from '@/lib/utils';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  return (
    <>
      <header className="sticky top-0 z-40 bg-off-white/95 backdrop-blur-sm border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-charcoal"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop left nav */}
            <nav className="hidden lg:flex items-center gap-8 text-[11px] tracking-widest uppercase">
              <Link href={ROUTES.SHOP} className="hover:text-blood-red transition-colors">Shop</Link>
              <MegaMenu id="football" label="Football" href={ROUTES.FOOTBALL} />
              <MegaMenu id="cricket" label="Cricket" href={ROUTES.CRICKET} />
              <MegaMenu id="streetwear" label="Streetwear" href={ROUTES.STREETWEAR} />
            </nav>

            {/* Center logo */}
            <Link href={ROUTES.HOME} className="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase">
              HEADERR
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-charcoal hover:text-blood-red transition-colors"
              >
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>
              <Link href={ROUTES.ACCOUNT} aria-label="Account" className="p-2 text-charcoal hover:text-blood-red transition-colors hidden sm:block">
                <User className="w-[18px] h-[18px]" />
              </Link>
              <Link href={ROUTES.WISHLIST} aria-label="Wishlist" className="p-2 text-charcoal hover:text-blood-red transition-colors hidden sm:block">
                <Heart className="w-[18px] h-[18px]" />
              </Link>
              <button
                onClick={openCart}
                aria-label={`Cart (${itemCount} items)`}
                className="p-2 text-charcoal hover:text-blood-red transition-colors relative"
              >
                <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-blood-red text-off-white text-[9px] font-bold flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
