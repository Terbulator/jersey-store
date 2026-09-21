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

export interface ImageCard {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
}

export interface MenuData {
  sections: MenuSection[];
  imageCards: ImageCard[];
  cta: { label: string; href: string };
  tagline: string;
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
    imageCards: [
      {
        image: 'https://images.unsplash.com/photo-1509027572446-af8401acfdc3?w=800&q=85',
        imageAlt: 'HEADERR latest collection',
        eyebrow: 'NEW ARRIVALS',
        title: 'LATEST CAMPAIGN',
        cta: { label: 'SHOP NEW →', href: ROUTES.NEW_ARRIVALS },
      },
      {
        image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=800&q=85',
        imageAlt: 'Football jersey collection',
        eyebrow: 'FOOTBALL',
        title: 'CLUBS & NATIONALS',
        cta: { label: 'SHOP FOOTBALL →', href: ROUTES.FOOTBALL },
      },
      {
        image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=85',
        imageAlt: 'Streetwear collection',
        eyebrow: 'STREETWEAR',
        title: 'OVERSIZED ESSENTIALS',
        cta: { label: 'SHOP STREETWEAR →', href: ROUTES.STREETWEAR },
      },
    ],
    cta: { label: 'VIEW ALL PRODUCTS →', href: ROUTES.SHOP },
    tagline: 'THE FULL COLLECTION.',
  },
  football: {
    sections: [
      {
        title: 'Shop Football',
        items: [
          { label: 'All Football', href: ROUTES.FOOTBALL },
          { label: 'New Arrivals', href: ROUTES.FOOTBALL + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.FOOTBALL + '?sort=best-selling' },
          { label: 'Limited Drops', href: ROUTES.FOOTBALL + '?sort=limited' },
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
    imageCards: [
      {
        image: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=800&q=85',
        imageAlt: 'Football jersey collection',
        eyebrow: 'COLLECTION',
        title: 'CLUBS & NATIONALS',
        cta: { label: 'SHOP FOOTBALL →', href: ROUTES.FOOTBALL },
      },
      {
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=85',
        imageAlt: 'Player Version jersey',
        eyebrow: 'PLAYER VERSION',
        title: 'MATCH READY',
        cta: { label: 'SHOP PLAYER →', href: ROUTES.FOOTBALL + '?edition=player' },
      },
      {
        image: 'https://images.unsplash.com/photo-1598221428011-33ef7e864d49?w=800&q=85',
        imageAlt: 'Master Edition jersey',
        eyebrow: 'MASTER EDITION',
        title: 'PREMIUM KNITS',
        cta: { label: 'SHOP MASTER →', href: ROUTES.FOOTBALL + '?edition=master' },
      },
    ],
    cta: { label: 'SHOP FOOTBALL →', href: ROUTES.FOOTBALL },
    tagline: 'THE GAME IS EVERYTHING.',
  },
  cricket: {
    sections: [
      {
        title: 'Shop Cricket',
        items: [
          { label: 'All Cricket', href: ROUTES.CRICKET },
          { label: 'New Arrivals', href: ROUTES.CRICKET + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.CRICKET + '?sort=best-selling' },
          { label: 'Limited Drops', href: ROUTES.CRICKET + '?sort=limited' },
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
    imageCards: [
      {
        image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=85',
        imageAlt: 'Cricket jersey collection',
        eyebrow: 'COLLECTION',
        title: 'TEAM & INTERNATIONAL',
        cta: { label: 'SHOP CRICKET →', href: ROUTES.CRICKET },
      },
      {
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=85',
        imageAlt: 'Player Version cricket jersey',
        eyebrow: 'PLAYER VERSION',
        title: 'MATCH READY',
        cta: { label: 'SHOP PLAYER →', href: ROUTES.CRICKET + '?edition=player' },
      },
      {
        image: 'https://images.unsplash.com/photo-1531014992611-d9c4f5d4b4fd?w=800&q=85',
        imageAlt: 'IPL cricket jersey',
        eyebrow: 'IPL',
        title: 'FRANCHISE KITS',
        cta: { label: 'SHOP IPL →', href: ROUTES.CRICKET + '?category=ipl' },
      },
    ],
    cta: { label: 'SHOP CRICKET →', href: ROUTES.CRICKET },
    tagline: 'CRICKET CULTURE.',
  },
  streetwear: {
    sections: [
      {
        title: 'Shop Streetwear',
        items: [
          { label: 'All Streetwear', href: ROUTES.STREETWEAR },
          { label: 'New Arrivals', href: ROUTES.STREETWEAR + '?sort=newest' },
          { label: 'Best Sellers', href: ROUTES.STREETWEAR + '?sort=best-selling' },
          { label: 'Limited Edition', href: ROUTES.STREETWEAR + '?sort=limited' },
        ],
      },
      {
        title: 'Apparel',
        items: [
          { label: 'Tees', href: ROUTES.STREETWEAR + '?category=tees' },
          { label: 'Hoodies', href: ROUTES.STREETWEAR + '?category=hoodies' },
          { label: 'Sweatshirts', href: ROUTES.STREETWEAR + '?category=sweatshirts' },
        ],
      },
      {
        title: 'Collection',
        items: [
          { label: 'HEADERR Collections', href: ROUTES.STREETWEAR + '?brand=headerr' },
          { label: 'Limited Drops', href: ROUTES.STREETWEAR + '?sort=limited' },
        ],
      },
    ],
    imageCards: [
      {
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
        imageAlt: 'HEADERR oversized tee',
        eyebrow: 'TEES',
        title: 'OVERSIZED ESSENTIALS',
        cta: { label: 'SHOP TEES →', href: ROUTES.STREETWEAR + '?category=tees' },
      },
      {
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=85',
        imageAlt: 'HEADERR hoodie',
        eyebrow: 'HOODIES',
        title: 'HEAVYWEIGHT FRENCH TERRY',
        cta: { label: 'SHOP HOODIES →', href: ROUTES.STREETWEAR + '?category=hoodies' },
      },
      {
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=85',
        imageAlt: 'HEADERR sweatshirt',
        eyebrow: 'SWEATSHIRTS',
        title: 'CREWNECK FLEECE',
        cta: { label: 'SHOP SWEATS →', href: ROUTES.STREETWEAR + '?category=sweatshirts' },
      },
    ],
    cta: { label: 'SHOP STREETWEAR →', href: ROUTES.STREETWEAR },
    tagline: 'WEAR THE CULTURE.',
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
    imageCards: [
      {
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85',
        imageAlt: 'HEADERR match day community',
        eyebrow: 'MATCH DAY',
        title: 'COMMUNITY STORIES',
        cta: { label: 'READ MORE →', href: '/culture#matchday' },
      },
      {
        image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&q=85',
        imageAlt: 'HEADERR editorial campaign',
        eyebrow: 'EDITORIAL',
        title: 'CAMPAIGNS & STORIES',
        cta: { label: 'VIEW EDITORIALS →', href: '/culture#editorials' },
      },
      {
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
        imageAlt: 'HEADERR IRL community',
        eyebrow: 'HEADERR IRL',
        title: 'REAL PEOPLE',
        cta: { label: 'FOLLOW US →', href: '/culture#irl' },
      },
    ],
    cta: { label: 'EXPLORE CULTURE →', href: '/culture' },
    tagline: 'MORE THAN A JERSEY.',
  },
};

export const NAV_Items = [
  { id: 'shop' as const, label: 'Shop', href: ROUTES.SHOP },
  { id: 'football' as const, label: 'Football', href: ROUTES.FOOTBALL },
  { id: 'cricket' as const, label: 'Cricket', href: ROUTES.CRICKET },
  { id: 'streetwear' as const, label: 'Streetwear', href: ROUTES.STREETWEAR },
  { id: 'culture' as const, label: 'Culture', href: '/culture' },
];