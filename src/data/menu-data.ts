import { ROUTES } from '@/lib/utils';

export type MenuId = 'shop' | 'football' | 'cricket' | 'streetwear' | 'culture' | null;

export interface MenuItem {
  label: string;
  href: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface MenuData {
  sections: MenuSection[];
  image: string;
  imageAlt: string;
  cta: { label: string; href: string };
}

export const MENUS: Record<string, MenuData> = {
  shop: {
    sections: [
      {
        title: 'Shop',
        items: [
          { label: 'Shop All', href: ROUTES.SHOP },
          { label: 'New Arrivals', href: ROUTES.SHOP + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.SHOP + '?sort=best-selling' },
          { label: 'Limited Drops', href: ROUTES.SHOP + '?sort=limited' },
        ],
      },
      {
        title: 'Jerseys',
        items: [
          { label: 'Football', href: ROUTES.FOOTBALL },
          { label: 'Cricket', href: ROUTES.CRICKET },
          { label: 'Player Version', href: ROUTES.SHOP + '?edition=player' },
          { label: 'Master Edition', href: ROUTES.SHOP + '?edition=master' },
          { label: 'Special Edition', href: ROUTES.SHOP + '?edition=special' },
        ],
      },
      {
        title: 'Streetwear',
        items: [
          { label: 'Oversized Tees', href: ROUTES.STREETWEAR + '?category=oversized' },
          { label: 'Hoodies', href: ROUTES.STREETWEAR + '?category=hoodies' },
          { label: 'Sweatshirts', href: ROUTES.STREETWEAR + '?category=sweatshirts' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80',
    imageAlt: 'HEADERR latest collection',
    cta: { label: 'Shop All', href: ROUTES.SHOP },
  },
  football: {
    sections: [
      {
        title: 'Shop Football',
        items: [
          { label: 'All Football', href: ROUTES.FOOTBALL },
          { label: 'New Arrivals', href: ROUTES.FOOTBALL + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.FOOTBALL + '?sort=best-selling' },
        ],
      },
      {
        title: 'Edition',
        items: [
          { label: 'Player Version', href: ROUTES.FOOTBALL + '?edition=player' },
          { label: 'Master Edition', href: ROUTES.FOOTBALL + '?edition=master' },
          { label: 'Special Edition', href: ROUTES.FOOTBALL + '?edition=special' },
        ],
      },
      {
        title: 'Collection',
        items: [
          { label: 'Club Jerseys', href: ROUTES.FOOTBALL + '?category=club' },
          { label: 'National Team Jerseys', href: ROUTES.FOOTBALL + '?category=national' },
          { label: 'World Cup', href: ROUTES.FOOTBALL + '?category=world-cup' },
          { label: 'Limited Drops', href: ROUTES.FOOTBALL + '?sort=limited' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=600&q=80',
    imageAlt: 'Football jersey collection',
    cta: { label: 'Shop Football', href: ROUTES.FOOTBALL },
  },
  cricket: {
    sections: [
      {
        title: 'Shop Cricket',
        items: [
          { label: 'All Cricket', href: ROUTES.CRICKET },
          { label: 'New Arrivals', href: ROUTES.CRICKET + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.CRICKET + '?sort=best-selling' },
        ],
      },
      {
        title: 'Edition',
        items: [
          { label: 'Player Version', href: ROUTES.CRICKET + '?edition=player' },
          { label: 'Master Edition', href: ROUTES.CRICKET + '?edition=master' },
          { label: 'Special Edition', href: ROUTES.CRICKET + '?edition=special' },
        ],
      },
      {
        title: 'Collection',
        items: [
          { label: 'IPL', href: ROUTES.CRICKET + '?category=ipl' },
          { label: 'International', href: ROUTES.CRICKET + '?category=international' },
          { label: 'Team Jerseys', href: ROUTES.CRICKET + '?category=team' },
          { label: 'Limited Drops', href: ROUTES.CRICKET + '?sort=limited' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=600&q=80',
    imageAlt: 'Cricket jersey collection',
    cta: { label: 'Shop Cricket', href: ROUTES.CRICKET },
  },
  streetwear: {
    sections: [
      {
        title: 'Shop Streetwear',
        items: [
          { label: 'All Streetwear', href: ROUTES.STREETWEAR },
          { label: 'New Arrivals', href: ROUTES.STREETWEAR + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.STREETWEAR + '?sort=best-selling' },
        ],
      },
      {
        title: 'Category',
        items: [
          { label: 'Oversized Tees', href: ROUTES.STREETWEAR + '?category=oversized' },
          { label: 'Hoodies', href: ROUTES.STREETWEAR + '?category=hoodies' },
          { label: 'Sweatshirts', href: ROUTES.STREETWEAR + '?category=sweatshirts' },
        ],
      },
      {
        title: 'Collection',
        items: [
          { label: 'Limited Edition', href: ROUTES.STREETWEAR + '?sort=limited' },
          { label: 'HEADERR Collections', href: ROUTES.STREETWEAR + '?brand=headerr' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
    imageAlt: 'Streetwear collection',
    cta: { label: 'Shop Streetwear', href: ROUTES.STREETWEAR },
  },
  culture: {
    sections: [
      {
        title: 'Community',
        items: [
          { label: 'The Community', href: '/culture' },
          { label: 'What the Community Says', href: '/culture#reviews' },
          { label: 'Follow the Culture', href: '/culture#follow' },
          { label: 'Match Day', href: '/culture#matchday' },
          { label: 'HEADERR Stories', href: '/culture#stories' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&q=80',
    imageAlt: 'HEADERR community',
    cta: { label: 'Explore Culture', href: '/culture' },
  },
};

export const NAV_ITEMS = [
  { id: 'shop' as const, label: 'Shop', href: ROUTES.SHOP },
  { id: 'football' as const, label: 'Football', href: ROUTES.FOOTBALL },
  { id: 'cricket' as const, label: 'Cricket', href: ROUTES.CRICKET },
  { id: 'streetwear' as const, label: 'Streetwear', href: ROUTES.STREETWEAR },
  { id: 'culture' as const, label: 'Culture', href: '/culture' },
];
