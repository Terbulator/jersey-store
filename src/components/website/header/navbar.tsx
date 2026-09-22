'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, AnimatePresence } from 'framer-motion';
import { SearchOverlay } from '../search/search-overlay';
import { MegaNav } from './mega-nav';
import { MobileMenu } from './mobile-menu';
import { CartDrawer } from '../cart/cart-drawer';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/utils';
import type { MenuId } from '@/data/menu-data';
import { headerEntrance, headerNavStagger, headerIconStagger, EASE_PREMIUM } from '@/components/motion/motion-variants';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerMounted, setHeaderMounted] = useState(false);

  const [megaActive, setMegaActive] = useState<MenuId>(null);

  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(5, 25, 47, 0)', 'rgba(5, 25, 47, 0.98)']
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(58, 79, 42, 0)', 'rgba(58, 79, 42, 0.3)']
  );
  const headerBlur = useTransform(scrollY, [0, 100], [0, 24]);
  const headerBackdrop = useTransform(headerBlur, (v) => `blur(${v}px)`);

  const navColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(245, 243, 237, 0.9)', '#05192F']
  );
  const iconColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(245, 243, 237, 0.9)', '#F5F3ED']
  );
  const logoColor = useSpring(iconColor, { stiffness: 300, damping: 30 });

  useEffect(() => {
    setHeaderMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', () => setMegaActive(null));
    return unsubscribe;
  }, [scrollY]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaActive(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleMegaEnter = useCallback((id: MenuId) => setMegaActive(id), []);
  const handleMegaLeave = useCallback(() => setMegaActive(null), []);
  const handleClickSection = useCallback((id: MenuId) => setMegaActive(null), []);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
          backdropFilter: headerBackdrop,
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-transparent transition-colors duration-350"
        aria-label="Main navigation"
        variants={headerEntrance}
        initial={headerMounted ? 'hidden' : 'hidden'}
        animate={headerMounted ? 'visible' : 'hidden'}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px] relative">
            <motion.button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 z-10"
              aria-label="Open menu"
              style={{ color: iconColor }}
              variants={headerIconStagger}
              custom={0}
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </motion.button>

            <div className="hidden lg:block">
              <MegaNav
                active={megaActive}
                onEnter={handleMegaEnter}
                onLeave={handleMegaLeave}
                onClickSection={handleClickSection}
              />
            </div>

            <motion.span
              style={{ color: logoColor }}
              className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl font-bold tracking-[0.25em] uppercase z-10"
              variants={headerEntrance}
            >
              <Link href={ROUTES.HOME} aria-label="HEADERR Home">HEADERR</Link>
            </motion.span>

            <motion.div
              className="flex items-center gap-2 sm:gap-3 z-10"
              variants={headerIconStagger}
            >
              <motion.button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 transition-colors duration-300"
                style={{ color: iconColor }}
                custom={1}
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </motion.button>
              <motion.a
                href={ROUTES.ACCOUNT}
                aria-label="Account"
                className="p-2 transition-colors duration-300 hidden sm:block"
                style={{ color: iconColor }}
                custom={2}
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </motion.a>
              <motion.a
                href={ROUTES.WISHLIST}
                aria-label="Wishlist"
                className="p-2 transition-colors duration-300 hidden sm:block"
                style={{ color: iconColor }}
                custom={3}
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </motion.a>
              <motion.button
                onClick={openCart}
                aria-label={`Cart (${itemCount} items)`}
                className="p-2 transition-colors duration-300 relative"
                style={{ color: iconColor }}
                custom={4}
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red text-off-white text-[9px] font-bold flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
      <CartDrawer />
    </>
  );
}