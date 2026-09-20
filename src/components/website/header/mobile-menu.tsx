'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, User, Heart, ShoppingBag, Search } from 'lucide-react';
import { ROUTES } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: 'SHOP', href: ROUTES.SHOP },
  { label: 'FOOTBALL', href: ROUTES.FOOTBALL },
  { label: 'CRICKET', href: ROUTES.CRICKET },
  { label: 'STREETWEAR', href: ROUTES.STREETWEAR },
  { label: 'NEW ARRIVALS', href: `${ROUTES.SHOP}?sort=newest` },
  { label: 'BEST SELLERS', href: `${ROUTES.SHOP}?sort=best-selling` },
  { label: 'SALE', href: `${ROUTES.SHOP}?sale=true` },
];

const ACCOUNT_ITEMS = [
  { label: 'ACCOUNT', href: ROUTES.ACCOUNT, icon: User },
  { label: 'WISHLIST', href: ROUTES.WISHLIST, icon: Heart },
  { label: 'ORDERS', href: `${ROUTES.ACCOUNT}/orders`, icon: ShoppingBag },
  { label: 'HELP', href: '/help', icon: Search },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" onPointerDown={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-xs bg-off-white shadow-2xl p-6 flex flex-col"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-lg font-bold tracking-widest uppercase">MENU</span>
          <button onClick={onClose} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block py-3 text-sm tracking-widest uppercase border-b border-charcoal/10 hover:text-blood-red transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-charcoal/10">
            <ul className="space-y-1">
              {ACCOUNT_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 py-3 text-sm tracking-widest uppercase hover:text-blood-red transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-charcoal/10">
          <p className="text-xs text-chrome tracking-wider uppercase">HEADERR.IN</p>
        </div>
      </div>
    </div>
  );
}