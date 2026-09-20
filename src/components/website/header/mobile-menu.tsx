'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, User, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENUS, NAV_ITEMS } from '@/data/menu-data';
import { ROUTES } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const ACCOUNT_ITEMS = [
  { label: 'Account', href: ROUTES.ACCOUNT, icon: User },
  { label: 'Wishlist', href: ROUTES.WISHLIST, icon: Heart },
  { label: 'Orders', href: ROUTES.ACCOUNT + '/orders', icon: ShoppingBag },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setExpanded(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 bg-off-white flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-14 border-b border-charcoal/8">
              <span className="text-xs tracking-[0.2em] uppercase font-medium">Menu</span>
              <button onClick={onClose} aria-label="Close menu" className="p-2 -mr-2">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-0">
                {NAV_ITEMS.map((item, i) => {
                  const menu = MENUS[item.id];
                  const isExpanded = expanded === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
                    >
                      <div className="border-b border-charcoal/6">
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="flex-1 py-4 text-xl tracking-wider uppercase text-charcoal hover:text-blood-red transition-colors duration-300"
                          >
                            {item.label}
                          </Link>
                          <button
                            onClick={() => toggle(item.id)}
                            className="p-2 -mr-2 text-charcoal"
                            aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>
                        <AnimatePresence>
                          {isExpanded && menu && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pb-4 pl-2 space-y-1">
                                {menu.sections.map((section) => (
                                  <div key={section.title}>
                                    <p className="text-[10px] tracking-[0.15em] uppercase text-chrome mt-3 mb-1.5 font-medium">
                                      {section.title}
                                    </p>
                                    {section.items.map((link) => (
                                      <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={onClose}
                                        className="block py-2 text-sm text-charcoal/70 hover:text-blood-red transition-colors duration-200"
                                      >
                                        {link.label}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-6 border-t border-charcoal/8">
                <p className="text-[10px] tracking-[0.2em] uppercase text-chrome mb-4 font-medium">
                  Account
                </p>
                <ul className="space-y-0">
                  {ACCOUNT_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.04, duration: 0.35 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-3.5 text-sm tracking-wider uppercase text-charcoal hover:text-blood-red transition-colors duration-300"
                      >
                        <item.icon className="w-4 h-4" strokeWidth={1.5} />
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="px-6 py-5 border-t border-charcoal/8"
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
