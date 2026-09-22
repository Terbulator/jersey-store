'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronDown, ChevronUp, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { NAV_Items, MENUS, type MenuId } from '@/data/menu-data';
import { useCartStore } from '@/store/cart-store';
import { ROUTES } from '@/lib/utils';
import { mobileDrawer, accordionItem, fadeUpSmall } from '@/components/motion/motion-variants';

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const [openSections, setOpenSections] = useState<Set<MenuId>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const itemCount = useCartStore((s) => s.itemCount());

  const toggleSection = (id: MenuId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={mobileDrawer}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-navy z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-olive/20">
          <span className="text-lg font-bold tracking-[0.25em] uppercase text-off-white">MENU</span>
          <motion.button
            onClick={onClose}
            className="p-2 text-sage hover:text-gold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-olive/10">
          <motion.button
            onClick={() => { setSearchOpen(true); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-deep-blue border border-sage rounded-md text-sage hover:border-gold transition-colors"
            whileHover={{ x: 4 }}
          >
            <Search className="w-5 h-5 text-sage" strokeWidth={1.5} />
            <span className="text-sm text-sage">Search</span>
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_Items.map((item) => {
            const isOpen = openSections.has(item.id);
            const hasMega = MENUS[item.id]?.sections.length > 0;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasMega) {
                      toggleSection(item.id);
                    } else {
                      onClose();
                      window.location.href = item.href;
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sage font-medium transition-colors ${
                    hasMega ? 'hover:text-gold' : 'text-off-white'
                  }`}
                >
                  <span className="text-[11px] tracking-[0.15em] uppercase">{item.label}</span>
                  {hasMega && (
                    <motion.span
                      variants={shouldReduceMotion ? { closed: { rotate: 0 }, open: { rotate: 180 } } : undefined}
                      animate={isOpen ? 'open' : 'closed'}
                      className="text-sage"
                    >
                      <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && hasMega && (
                    <motion.div
                      variants={accordionItem}
                      animate={isOpen ? 'open' : 'closed'}
                      className="overflow-hidden pl-4 border-l border-olive/10 ml-2"
                    >
                      <div className="space-y-1 mt-2">
                        {MENUS[item.id]!.sections.map((section) => (
                          <div key={section.title} className="space-y-1">
                            <p className="text-[9px] tracking-[0.2em] uppercase text-olive font-medium mb-2">
                              {section.title}
                            </p>
                            <ul className="space-y-1">
                              {section.items.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  onClick={onClose}
                                  className="block px-3 py-2 text-[12px] text-sage/70 hover:text-gold hover:bg-olive/5 rounded transition-all duration-200"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {MENUS[item.id]!.imageCards.map((card) => (
                          <Link
                            key={card.title}
                            href={card.cta.href}
                            onClick={onClose}
                            className="block mt-4 overflow-hidden rounded-lg"
                          >
                            <div className="aspect-[4/3] overflow-hidden relative">
                              <img
                                src={card.image}
                                alt={card.imageAlt}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white/50 text-[7px] tracking-[0.2em] uppercase font-medium mb-1">
                                {card.eyebrow}
                              </p>
                              <p className="text-white font-semibold text-[12px] leading-tight">{card.title}</p>
                            </div>
                          </Link>
                        ))}
                        <div className="mt-4 pt-4 border-t border-olive/10">
                          <Link
                            href={MENUS[item.id]!.cta.href}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-gold font-medium hover:gap-3 transition-all"
                          >
                            {MENUS[item.id]!.cta.label}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Utility Links */}
        <div className="p-4 border-t border-olive/20 space-y-3">
          <Link
            href={ROUTES.ACCOUNT}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sage hover:text-gold transition-colors"
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Account</span>
          </Link>
          <Link
            href={ROUTES.WISHLIST}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sage hover:text-gold transition-colors"
          >
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Wishlist</span>
          </Link>
          <Link
            href={ROUTES.CART}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sage hover:text-gold transition-colors"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-medium">Cart</span>
            {itemCount > 0 && (
              <span className="ml-auto min-w-[18px] h-5 bg-red text-off-white text-[9px] font-bold flex items-center justify-center px-1.5 rounded">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}