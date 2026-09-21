'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { SearchOverlay } from '../search/search-overlay';
import { MegaNav } from './mega-nav';
import { MobileMenu } from './mobile-menu';
import { SectionCanvas } from './section-canvas';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/utils';
import type { MenuId } from '@/data/menu-data';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const [megaActive, setMegaActive] = useState<MenuId>(null);
  const [canvasActive, setCanvasActive] = useState<MenuId>(null);

  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(239,236,230,0)', 'rgba(239,236,230,0.98)']
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(35,35,35,0)', 'rgba(35,35,35,0.1)']
  );
  const headerBlur = useTransform(scrollY, [0, 100], [0, 16]);
  const headerBackdrop = useTransform(headerBlur, (v) => `blur(${v}px)`);
  
  const navColor = useTransform(
    scrollY,
    [0, 100],
    ['#EFECE6', '#080808']
  );
  const iconColor = useTransform(
    scrollY,
    [0, 100],
    ['#080808', '#EFECE6']
  );

  const logoColor = useSpring(navColor, { stiffness: 300, damping: 30 });

  // Canvas-active color overrides
  const canvasIconColor = useMotionValue('#fff');
  const canvasLogoColor = useMotionValue('#fff');
  const canvasNavColor = useMotionValue('#fff');

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', () => setMegaActive(null));
    return unsubscribe;
  }, [scrollY]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCanvasActive(null);
        setMegaActive(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<MenuId>).detail;
      if (id) setCanvasActive(id);
    };
    window.addEventListener('headerr:canvas-switch', handler);
    return () => window.removeEventListener('headerr:canvas-switch', handler);
  }, []);

  // Update canvas colors when canvasActive changes
  useEffect(() => {
    if (canvasActive) {
      canvasIconColor.set('#fff');
      canvasLogoColor.set('#fff');
      canvasNavColor.set('#fff');
    } else {
      // Reset to default (will be overridden by scroll transform)
      canvasIconColor.set('#080808');
      canvasLogoColor.set('#EFECE6');
      canvasNavColor.set('#EFECE6');
    }
  }, [canvasActive, canvasIconColor, canvasLogoColor, canvasNavColor]);

  const handleMegaEnter = useCallback((id: MenuId) => setMegaActive(id), []);
  const handleMegaLeave = useCallback(() => setMegaActive(null), []);

  const handleClickSection = useCallback((id: MenuId) => {
    setMegaActive(null);
    setCanvasActive(id);
  }, []);

  const handleCanvasClose = useCallback(() => {
    setCanvasActive(null);
  }, []);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: canvasActive ? 'transparent' : headerBg,
          borderBottomColor: canvasActive ? 'transparent' : headerBorder,
          backdropFilter: canvasActive ? 'none' : headerBackdrop,
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-transparent transition-colors duration-300"
        aria-label="Main navigation"
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px] relative">
            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 z-10"
              aria-label="Open menu"
              style={{ color: canvasActive ? canvasIconColor : iconColor }}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </motion.button>

            {/* Desktop left nav + mega menu */}
            <div className="hidden lg:block">
              <MegaNav
                active={megaActive}
                canvasActive={canvasActive}
                onEnter={handleMegaEnter}
                onLeave={handleMegaLeave}
                onClickSection={handleClickSection}
                navColor={canvasActive ? canvasNavColor : navColor}
                isAtTop={isAtTop && !canvasActive}
              />
            </div>

            {/* Center logo */}
            {!canvasActive && (
              <motion.span
                style={{ color: canvasActive ? canvasLogoColor : logoColor }}
                className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl font-bold tracking-[0.25em] uppercase z-10"
              >
                HEADERR
              </motion.span>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3 z-10">
              {!canvasActive && (
                <>
                  <motion.button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                    className="p-2 transition-colors duration-300"
                    style={{ color: canvasActive ? canvasIconColor : iconColor }}
                  >
                    <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </motion.button>
                  <motion.a
                    href={ROUTES.ACCOUNT}
                    aria-label="Account"
                    className="p-2 transition-colors duration-300 hidden sm:block"
                    style={{ color: canvasActive ? canvasIconColor : iconColor }}
                  >
                    <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </motion.a>
                  <motion.a
                    href={ROUTES.WISHLIST}
                    aria-label="Wishlist"
                    className="p-2 transition-colors duration-300 hidden sm:block"
                    style={{ color: canvasActive ? canvasIconColor : iconColor }}
                  >
                    <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </motion.a>
                  <motion.button
                    onClick={openCart}
                    aria-label={`Cart (${itemCount} items)`}
                    className="p-2 transition-colors duration-300 relative"
                    style={{ color: canvasActive ? canvasIconColor : iconColor }}
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
                  </motion.button>
                </>
              )}
              
              {canvasActive && (
                <motion.button
                  onClick={handleCanvasClose}
                  aria-label="Close navigation"
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group p-2"
                >
                  <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase font-medium">
                    Close
                  </span>
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.5} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <SectionCanvas active={canvasActive} onClose={handleCanvasClose} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenCanvas={handleClickSection}
      />
    </>
  );
}