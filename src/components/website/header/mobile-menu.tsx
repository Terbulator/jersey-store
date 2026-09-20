'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, User, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: 'SHOP ALL', href: ROUTES.SHOP },
  { label: 'FOOTBALL', href: ROUTES.FOOTBALL },
  { label: 'CRICKET', href: ROUTES.CRICKET },
  { label: 'STREETWEAR', href: ROUTES.STREETWEAR },
  { label: 'NEW ARRIVALS', href: `${ROUTES.SHOP}?sort=newest` },
  { label: 'BEST SELLERS', href: `${ROUTES.SHOP}?sort=best-selling` },
];

const ACCOUNT_ITEMS = [
  { label: 'ACCOUNT', href: ROUTES.ACCOUNT, icon: User },
  { label: 'WISHLIST', href: ROUTES.WISHLIST, icon: Heart },
  { label: 'ORDERS', href: `${ROUTES.ACCOUNT}/orders`, icon: ShoppingBag },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Panel — full screen */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 bg-off-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-charcoal/8">
              <span className="text-xs tracking-[0.2em] uppercase font-medium">Menu</span>
              <button onClick={onClose} aria-label="Close menu" className="p-2 -mr-2">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-6 py-8">
              <ul className="space-y-0">
                {MENU_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.05,
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-4 text-2xl sm:text-3xl tracking-wider uppercase text-charcoal hover:text-blood-red transition-colors duration-300 border-b border-charcoal/6"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Account links */}
              <div className="mt-10 pt-8 border-t border-charcoal/8">
                <p className="text-[10px] tracking-[0.2em] uppercase text-chrome mb-4 font-medium">
                  Account
                </p>
                <ul className="space-y-0">
                  {ACCOUNT_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.4 + i * 0.05,
                        duration: 0.4,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-3.5 text-sm tracking-widest uppercase text-charcoal hover:text-blood-red transition-colors duration-300"
                      >
                        <item.icon className="w-4 h-4" strokeWidth={1.5} />
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="px-6 py-6 border-t border-charcoal/8"
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-chrome">
                HEADERR &copy; 2026
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
