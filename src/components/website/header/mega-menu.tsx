'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES, cn } from '@/lib/utils';

const MEGA_MENU_DATA = {
  football: {
    categories: [
      { label: 'All Football', href: ROUTES.FOOTBALL },
      { label: 'Club Jerseys', href: `${ROUTES.FOOTBALL}?category=club` },
      { label: 'National Teams', href: `${ROUTES.FOOTBALL}?category=national` },
      { label: 'Player Version', href: `${ROUTES.FOOTBALL}?edition=player` },
      { label: 'Master Edition', href: `${ROUTES.FOOTBALL}?edition=master` },
    ],
    image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=600&q=80',
    imageLabel: 'THE GAME IS BACK.',
  },
  cricket: {
    categories: [
      { label: 'All Cricket', href: ROUTES.CRICKET },
      { label: 'IPL', href: `${ROUTES.CRICKET}?category=ipl` },
      { label: 'International', href: `${ROUTES.CRICKET}?category=international` },
      { label: 'Player Version', href: `${ROUTES.CRICKET}?edition=player` },
      { label: 'Master Edition', href: `${ROUTES.CRICKET}?edition=master` },
    ],
    image: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=600&q=80',
    imageLabel: 'CRICKET CULTURE.',
  },
  streetwear: {
    categories: [
      { label: 'All Streetwear', href: ROUTES.STREETWEAR },
      { label: 'T-Shirts', href: `${ROUTES.STREETWEAR}?category=t-shirts` },
      { label: 'Oversized Tees', href: `${ROUTES.STREETWEAR}?category=oversized` },
      { label: 'Sweatshirts', href: `${ROUTES.STREETWEAR}?category=sweatshirts` },
      { label: 'Accessories', href: `${ROUTES.STREETWEAR}?category=accessories` },
    ],
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
    imageLabel: 'STREETWEAR DROPS.',
  },
};

interface MegaMenuProps {
  id: keyof typeof MEGA_MENU_DATA;
  label: string;
  href: string;
}

export function MegaMenu({ id, label, href }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const data = MEGA_MENU_DATA[id];

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className="flex items-center gap-1 py-1 hover:text-blood-red transition-colors duration-300"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {label}
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform duration-300',
            open && 'rotate-180'
          )}
          strokeWidth={1.5}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
          >
            <div
              className="w-[580px] bg-off-white border border-charcoal/8 shadow-2xl p-8"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <div className="grid grid-cols-[1fr_200px] gap-8">
                <div>
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-chrome mb-4 font-medium">
                    {label}
                  </h4>
                  <ul className="space-y-2.5">
                    {data.categories.map((cat, i) => (
                      <motion.li
                        key={cat.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <Link
                          href={cat.href}
                          className="block text-sm text-charcoal hover:text-blood-red transition-colors duration-200"
                        >
                          {cat.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="relative overflow-hidden"
                >
                  <img
                    src={data.image}
                    alt={data.imageLabel}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-off-white text-[10px] tracking-[0.2em] uppercase font-bold text-center px-4">
                      {data.imageLabel}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
