'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SearchOverlay } from '../search/search-overlay';
import { MegaNav } from './mega-nav';
import { MobileMenu } from './mobile-menu';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/utils';
import type { MenuId } from '@/data/menu-data';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaActive, setMegaActive] = useState<MenuId>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 120], ['rgba(239,236,230,0)', 'rgba(239,236,230,0.97)']);
  const headerBorder = useTransform(scrollY, [0, 120], ['rgba(35,35,35,0)', 'rgba(35,35,35,0.08)']);
  const headerBlur = useTransform(scrollY, [0, 120], [0, 12]);

  // Close mega menu on route change or scroll
  useEffect(() => {
    const unsubscribe = scrollY.on('change', () => setMegaActive(null));
    return unsubscribe;
  }, [scrollY]);

  // Close mega menu on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaActive(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleMegaEnter = (id: MenuId) => setMegaActive(id);
  const handleMegaLeave = () => setMegaActive(null);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
          backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-transparent"
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-charcoal"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Desktop left nav + mega menu */}
            <div className="hidden lg:block">
              <MegaNav active={megaActive} onEnter={handleMegaEnter} onLeave={handleMegaLeave} />
            </div>

            {/* Center logo */}
            <Link
              href={ROUTES.HOME}
              className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl font-bold tracking-[0.25em] uppercase"
            >
              HEADERR
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-charcoal hover:text-blood-red transition-colors duration-300"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
              <Link
                href={ROUTES.ACCOUNT}
                aria-label="Account"
                className="p-2 text-charcoal hover:text-blood-red transition-colors duration-300 hidden sm:block"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <Link
                href={ROUTES.WISHLIST}
                aria-label="Wishlist"
                className="p-2 text-charcoal hover:text-blood-red transition-colors duration-300 hidden sm:block"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <button
                onClick={openCart}
                aria-label={`Cart (${itemCount} items)`}
                className="p-2 text-charcoal hover:text-blood-red transition-colors duration-300 relative"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-blood-red text-off-white text-[9px] font-bold flex items-center justify-center px-1"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
