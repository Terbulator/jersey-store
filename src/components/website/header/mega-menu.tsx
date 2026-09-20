'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { ROUTES } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MEGA_MENU_DATA = {
  football: {
    categories: ['All Football', 'Club Jerseys', 'National Teams', 'Player Version', 'Master Edition'],
    featured: ['New Arrivals', 'Best Sellers', 'Limited Drops'],
    image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=600&q=80',
    imageLabel: 'THE GAME IS BACK.',
  },
  cricket: {
    categories: ['All Cricket', 'IPL', 'International', 'Player Version', 'Master Edition'],
    featured: ['New Arrivals', 'Best Sellers', 'Limited Drops'],
    image: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=600&q=80',
    imageLabel: 'CRICKET CULTURE.',
  },
  streetwear: {
    categories: ['T-Shirts', 'Oversized Tees', 'Sweatshirts', 'Accessories'],
    featured: ['New Arrivals', 'Best Sellers', 'Limited Drops'],
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
        className="flex items-center gap-1 hover:text-blood-red transition-colors"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {label}
        <ChevronDown className="w-3 h-3" />
      </Link>

      {open && (
        <div className="absolute top-full left-0 w-[600px] bg-off-white border border-charcoal/10 shadow-xl p-6 mt-0">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs tracking-widest uppercase text-blood-red mb-3">CATEGORIES</h4>
              <ul className="space-y-2">
                {data.categories.map((cat) => (
                  <li key={cat}>
                    <Link href={`${href}?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-charcoal hover:text-blood-red transition-colors"
                      onMouseEnter={() => setOpen(true)}
                      onMouseLeave={() => setOpen(false)}
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-widest uppercase text-blood-red mb-3">FEATURED</h4>
              <ul className="space-y-2">
                {data.featured.map((item) => (
                  <li key={item}>
                    <Link href={`${href}?sort=${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-charcoal hover:text-blood-red transition-colors"
                      onMouseEnter={() => setOpen(true)}
                      onMouseLeave={() => setOpen(false)}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative img-zoom">
              <img src={data.image} alt={data.imageLabel} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 flex items-center justify-center text-off-white text-xs tracking-widest uppercase font-bold">
                {data.imageLabel}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}