'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Search, User, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENUS, NAV_ITEMS, type MenuId } from '@/data/menu-data';
import { ROUTES } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

interface SectionCanvasProps {
  active: MenuId;
  onClose: () => void;
}

const STAGGER = {
  title: 0,
  divider: 0.06,
  columns: 0.1,
  columnItem: 0.025,
  cta: 0.22,
  headerActions: 0.28,
} as const;

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function SectionCanvas({ active, onClose }: SectionCanvasProps) {
  const data = active ? MENUS[active] : null;
  const navItem = active ? NAV_ITEMS.find((n) => n.id === active) : null;
  const prevActiveRef = useRef<MenuId>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    if (active) prevActiveRef.current = active;
  }, [active]);

  // ESC to close
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {active && data && (
        <motion.div
          key="canvas-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-50 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`${navItem?.label ?? ''} navigation`}
        >
          {/* ─── Background crossfade ─── */}
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="absolute inset-0"
              >
                <img
                  src={data.canvasImage}
                  alt={data.imageAlt}
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
                {/* Section-specific atmospheric overlay */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: data.accentColor }}
                />
                {/* Bottom gradient for content readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/20" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── Top bar: logo + section pills + header actions + close ─── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: STAGGER.headerActions, duration: 0.4, ease: EASE }}
            className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-14 h-[72px] border-b border-white/10"
          >
            <Link
              href="/"
              onClick={onClose}
              className="text-off-white text-lg sm:text-xl font-bold tracking-[0.25em] uppercase hover:opacity-70 transition-opacity duration-200"
            >
              HEADERR
            </Link>

            {/* Section pills — switch without closing */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8" role="tablist" aria-label="Navigation sections">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={active === item.id}
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('headerr:canvas-switch', { detail: item.id })
                    )
                  }
                  className={`text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-200 pb-0.5 border-b ${
                    active === item.id
                      ? 'text-off-white border-off-white'
                      : 'text-white/50 border-transparent hover:text-white/90 hover:border-white/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Header actions - search, account, wishlist, bag */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                aria-label="Search"
                className="p-2 text-white/70 hover:text-white transition-colors duration-300"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
              <Link
                href={ROUTES.ACCOUNT}
                aria-label="Account"
                className="p-2 text-white/70 hover:text-white transition-colors duration-300 hidden sm:block"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <Link
                href={ROUTES.WISHLIST}
                aria-label="Wishlist"
                className="p-2 text-white/70 hover:text-white transition-colors duration-300 hidden sm:block"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <button
                onClick={openCart}
                aria-label={`Cart (${itemCount} items)`}
                className="p-2 text-white/70 hover:text-white transition-colors duration-300 relative"
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

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200 group"
            >
              <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase font-medium">
                Close
              </span>
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.5} />
            </button>
          </motion.div>

          {/* ─── Main content with staggered reveal ─── */}
          <div
            className="relative z-10 flex-1 flex flex-col justify-end lg:justify-center px-6 sm:px-10 lg:px-14 pb-10 lg:pb-0 overflow-y-auto"
            onClick={handleBackdropClick}
          >
            <AnimatePresence mode="wait">
              <motion.div key={active} className="w-full max-w-[1400px] mx-auto">
                {/* 1. Section title + tagline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: STAGGER.title, duration: 0.5, ease: EASE }}
                  className="mb-4"
                >
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-3 lg:mb-4">
                    {data.tagline}
                  </p>
                  <h2
                    className="text-off-white font-bold uppercase leading-none tracking-[0.06em]"
                    style={{ fontSize: 'clamp(56px, 9vw, 108px)' }}
                  >
                    {navItem?.label}
                  </h2>
                </motion.div>

                {/* 2. Divider line */}
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0, originX: 0 }}
                  transition={{ delay: STAGGER.divider, duration: 0.45, ease: EASE }}
                  className="h-px bg-white/20 mb-10 lg:mb-12"
                />

                {/* 3. Category columns */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: STAGGER.columns, duration: 0.45, ease: EASE }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-16"
                >
                  {data.sections.map((section, sIdx) => (
                    <div key={section.title}>
                      <p className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-medium mb-5">
                        {section.title}
                      </p>
                      <ul className="space-y-3.5">
                        {section.items.map((link, lIdx) => (
                          <motion.li
                            key={link.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              delay: STAGGER.columns + sIdx * 0.04 + lIdx * STAGGER.columnItem,
                              duration: 0.35,
                              ease: EASE,
                            }}
                          >
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="group flex items-center gap-2 text-off-white/80 hover:text-off-white transition-colors duration-200"
                              style={{ fontSize: 'clamp(15px, 1.5vw, 19px)' }}
                            >
                              <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 opacity-0 group-hover:opacity-100">
                                <ArrowRight className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                              </span>
                              {link.label}
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>

                {/* 4. CTA button */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: STAGGER.cta, duration: 0.4, ease: EASE }}
                >
                  <Link
                    href={data.cta.href}
                    onClick={onClose}
                    className="inline-flex items-center gap-3 bg-off-white text-charcoal hover:bg-white px-8 py-4 text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-300 hover:gap-5 group"
                  >
                    {data.cta.label}
                    <ArrowRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile section switcher (bottom pill row) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: STAGGER.headerActions + 0.1, duration: 0.35, ease: EASE }}
            className="relative z-10 lg:hidden flex items-center gap-4 px-6 py-4 border-t border-white/10 overflow-x-auto hide-scrollbar"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={active === item.id}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('headerr:canvas-switch', { detail: item.id })
                  )
                }
                className={`flex-shrink-0 text-[10px] tracking-[0.2em] uppercase font-medium px-4 py-2 border transition-all duration-200 ${
                  active === item.id
                    ? 'border-white/80 text-white bg-white/10'
                    : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}