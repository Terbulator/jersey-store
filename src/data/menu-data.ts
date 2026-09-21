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
  canvasImage: string;
  tagline: string;
  accentColor: string;
}

export const MENUS: Record<string, MenuData> = {
  shop: {
    sections: [
      {
        title: 'Shop',
        items: [
          { label: 'All Products', href: ROUTES.SHOP },
          { label: 'New Arrivals', href: ROUTES.NEW_ARRIVALS },
          { label: 'Best Sellers', href: ROUTES.BEST_SELLERS },
          { label: 'Limited Drops', href: ROUTES.SALE },
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
    image: 'https://images.unsplash.com/photo-1509027572446-af8401acfdc3?w=800&q=85',
    imageAlt: 'HEADERR latest collection',
    cta: { label: 'SHOP ALL →', href: ROUTES.SHOP },
    canvasImage: 'https://images.unsplash.com/photo-1509027572446-af8401acfdc3?w=1920&q=90',
    tagline: 'THE FULL COLLECTION.',
    accentColor: 'rgba(0,0,0,0.45)',
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
    image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=800&q=85',
    imageAlt: 'Football jersey collection',
    cta: { label: 'SHOP FOOTBALL →', href: ROUTES.FOOTBALL },
    canvasImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=90',
    tagline: 'THE GAME IS EVERYTHING.',
    accentColor: 'rgba(8,0,0,0.55)',
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
          { label: 'Team Jerseys', href: ROUTES.CRICKET + '?category=team' },
          { label: 'International', href: ROUTES.CRICKET + '?category=international' },
          { label: 'IPL', href: ROUTES.CRICKET + '?category=ipl' },
          { label: 'Limited Drops', href: ROUTES.CRICKET + '?sort=limited' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=85',
    imageAlt: 'Cricket jersey collection',
    cta: { label: 'SHOP CRICKET →', href: ROUTES.CRICKET },
    canvasImage: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=90',
    tagline: 'CRICKET CULTURE.',
    accentColor: 'rgba(0,40,20,0.50)',
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
          { label: 'Tees', href: ROUTES.STREETWEAR + '?category=tees' },
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
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=85',
    imageAlt: 'Streetwear collection',
    cta: { label: 'SHOP STREETWEAR →', href: ROUTES.STREETWEAR },
    canvasImage: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1920&q=90',
    tagline: 'WEAR THE CULTURE.',
    accentColor: 'rgba(20,10,30,0.50)',
  },
  culture: {
    sections: [
      {
        title: 'Our Story',
        items: [
          { label: 'Our Story', href: '/culture' },
          { label: 'HEADERR Journal', href: '/culture#journal' },
          { label: 'Match Day', href: '/culture#matchday' },
        ],
      },
      {
        title: 'Community',
        items: [
          { label: 'What the Community Says', href: '/culture#reviews' },
          { label: 'Follow the Culture', href: '/culture#follow' },
          { label: 'HEADERR IRL', href: '/culture#irl' },
        ],
      },
      {
        title: 'Editorial',
        items: [
          { label: 'Editorials', href: '/culture#editorials' },
          { label: 'Campaigns', href: '/culture#campaigns' },
          { label: 'Community', href: '/culture#community' },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85',
    imageAlt: 'HEADERR community editorial',
    cta: { label: 'EXPLORE CULTURE →', href: '/culture' },
    canvasImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=90',
    tagline: 'MORE THAN A JERSEY.',
    accentColor: 'rgba(10,0,20,0.55)',
  },
};

export const NAV_ITEMS = [
  { id: 'shop' as const, label: 'Shop', href: ROUTES.SHOP },
  { id: 'football' as const, label: 'Football', href: ROUTES.FOOTBALL },
  { id: 'cricket' as const, label: 'Cricket', href: ROUTES.CRICKET },
  { id: 'streetwear' as const, label: 'Streetwear', href: ROUTES.STREETWEAR },
  { id: 'culture' as const, label: 'Culture', href: '/culture' },
];