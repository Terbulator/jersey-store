'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, User, Heart, ShoppingBag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENUS, NAV_ITEMS, type MenuId } from '@/data/menu-data';
import { ROUTES } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenCanvas: (id: MenuId) => void;
}

const ACCOUNT_ITEMS = [
  { label: 'Account', href: ROUTES.ACCOUNT, icon: User },
  { label: 'Wishlist', href: ROUTES.WISHLIST, icon: Heart },
  { label: 'Orders', href: ROUTES.ACCOUNT + '/orders', icon: ShoppingBag },
];

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function MobileMenu({ open, onClose, onOpenCanvas }: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<MenuId>(null);
  const [headerImage, setHeaderImage] = useState<string>('');
  const [headerTagline, setHeaderTagline] = useState<string>('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setExpandedSection(null);
      // Set default header image to shop
      const shopMenu = MENUS.shop;
      if (shopMenu) {
        setHeaderImage(shopMenu.canvasImage);
        setHeaderTagline(shopMenu.tagline);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (expandedSection && MENUS[expandedSection]) {
      setHeaderImage(MENUS[expandedSection].canvasImage);
      setHeaderTagline(MENUS[expandedSection].tagline);
    }
  }, [expandedSection]);

  const handleSectionTap = (id: MenuId) => {
    onClose();
    setTimeout(() => onOpenCanvas(id), 150);
  };

  const toggleExpand = (id: MenuId) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

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

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0 bg-off-white flex flex-col"
          >
            {/* Header with dynamic image */}
            <div className="relative h-48 lg:h-64 flex-shrink-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={expandedSection || 'default'}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute inset-0"
                >
                  <img
                    src={headerImage || MENUS.shop.canvasImage}
                    alt={headerTagline || MENUS.shop.tagline}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-1">
                      {headerTagline || MENUS.shop.tagline}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-charcoal/8">
              <span className="text-xs tracking-[0.2em] uppercase font-medium">Menu</span>
              <button onClick={onClose} aria-label="Close menu" className="p-2 -mr-2">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-0 mb-8">
                {NAV_ITEMS.map((item, i) => {
                  const menu = MENUS[item.id];
                  const isExpanded = expandedSection === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
                      className="border-b border-charcoal/6"
                    >
                      {/* Section header row */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSectionTap(item.id)}
                          className="flex-1 py-4 text-left group"
                          aria-label={`Open ${item.label} navigation`}
                        >
                          <span className="text-xl tracking-wider uppercase text-charcoal group-hover:text-blood-red transition-colors duration-300">
                            {item.label}
                          </span>
                        </button>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-2 -mr-2 text-chrome hover:text-blood-red transition-colors duration-200"
                          aria-label={`Expand ${item.label}`}
                          aria-expanded={isExpanded}
                        >
                          <motion.span
                            animate={{ rotate: isExpanded ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="block"
                          >
                            <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                          </motion.span>
                        </button>
                      </div>

                      {/* Expandable sub-links */}
                      <AnimatePresence>
                        {isExpanded && menu && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 pl-1 space-y-0">
                              {menu.sections.map((section) => (
                                <div key={section.title} className="mb-4">
                                  <p className="text-[9px] tracking-[0.2em] uppercase text-chrome mb-2 font-medium">
                                    {section.title}
                                  </p>
                                  {section.items.map((link) => (
                                    <Link
                                      key={link.label}
                                      href={link.href}
                                      onClick={onClose}
                                      className="block py-2 text-sm text-charcoal/60 hover:text-blood-red transition-colors duration-200"
                                    >
                                      {link.label}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                              <button
                                onClick={() => handleSectionTap(item.id)}
                                className="mt-3 flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-blood-red font-medium"
                              >
                                View full {item.label}
                                <ArrowRight className="w-3 h-3" strokeWidth={2} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Account links */}
              <div className="pt-4 border-t border-charcoal/8">
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