export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  comparePrice?: number;
  image: string;
  gallery: string[];
  team: string;
  season: string;
  player?: string;
  brand?: string;
  category: 'retro' | 'current' | 'world-cup';
  categoryLabel: string;
  featured?: boolean;
  inStock: boolean;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'barcelona-2015-messi-home',
    name: 'Barcelona 2014/15 Home — Messi #10',
    description:
      'Relive the treble-winning season. This Barcelona home jersey features the iconic Blaugrana stripes with embroidered club crest. Premium breathable fabric with moisture-wicking technology.',
    basePrice: 449,
    comparePrice: 599,
    image: img('photo-1517466787929-bc90951d0974'),
    gallery: [
      img('photo-1517466787929-bc90951d0974'),
      img('photo-1551958219-acbc608c6377'),
      img('photo-1606925797300-0b35e9d1794e'),
    ],
    team: 'Barcelona',
    season: '2014/15',
    player: '10',
    brand: 'Nike',
    category: 'retro',
    categoryLabel: 'Retro Classics',
    featured: true,
    inStock: true,
  },
  {
    id: '2',
    slug: 'manchester-united-2008-ronaldo',
    name: 'Manchester United 2007/08 Home — Ronaldo #7',
    description:
      'The famous double-winning shirt worn during the Champions League triumph. Classic red body with the iconic white chevron and embroidered crest.',
    basePrice: 449,
    comparePrice: 599,
    image: img('photo-1522093007474-d86e9bf7ba6f'),
    gallery: [
      img('photo-1522093007474-d86e9bf7ba6f'),
      img('photo-1606925797300-0b35e9d1794e'),
      img('photo-1551958219-acbc608c6377'),
    ],
    team: 'Manchester United',
    season: '2007/08',
    player: '7',
    brand: 'Nike',
    category: 'retro',
    categoryLabel: 'Retro Classics',
    featured: true,
    inStock: true,
  },
  {
    id: '3',
    slug: 'ac-milan-2006-ibrahimovic',
    name: 'AC Milan 2006/07 Home — Ibrahimović #9',
    description:
      'Rossoneri stripes in premium fabric. The shirt of the 2007 Champions League winners with embroidered crest and single sponsor panel.',
    basePrice: 449,
    image: img('photo-1544620347-c4fd4a3d5957'),
    gallery: [
      img('photo-1544620347-c4fd4a3d5957'),
      img('photo-1551958219-acbc608c6377'),
      img('photo-1577471488278-16eec37ffcc2'),
    ],
    team: 'AC Milan',
    season: '2006/07',
    player: '9',
    brand: 'Adidas',
    category: 'retro',
    categoryLabel: 'Retro Classics',
    inStock: true,
  },
  {
    id: '4',
    slug: 'argentina-2022-world-cup',
    name: 'Argentina 2022 World Cup — Messi #10',
    description:
      'Celeste and white stripes from the World Cup-winning campaign. Featuring three stars above a golden crest and the sky-blue sash.',
    basePrice: 549,
    image: img('photo-1522778119026-d647f0596c20'),
    gallery: [
      img('photo-1522778119026-d647f0596c20'),
      img('photo-1614632537190-23e4146777db'),
      img('photo-1577471488278-16eec37ffcc2'),
    ],
    team: 'Argentina',
    season: '2022',
    player: '10',
    brand: 'Adidas',
    category: 'world-cup',
    categoryLabel: 'World Cup 2026',
    featured: true,
    inStock: true,
  },
  {
    id: '5',
    slug: 'arsenal-2024-home',
    name: 'Arsenal 2024/25 Home',
    description:
      'Arsenal in their iconic red with white sleeves. Crafted for performance with AEROREADY moisture management and a sleek cannon crest.',
    basePrice: 449,
    image: img('photo-1552346154-21d32810aba3'),
    gallery: [
      img('photo-1552346154-21d32810aba3'),
      img('photo-1602674809970-1d8a2c4d6c8e'),
      img('photo-1551958219-acbc608c6377'),
    ],
    team: 'Arsenal',
    season: '2024/25',
    brand: 'Adidas',
    category: 'current',
    categoryLabel: 'Current Season',
    inStock: true,
  },
  {
    id: '6',
    slug: 'real-madrid-2024-home',
    name: 'Real Madrid 2024/25 Home — Bellingham #5',
    description:
      'Pure white with a subtle gold-dust heritage print. The shirt of the 15-time European champions with embroidered RMCF crest.',
    basePrice: 449,
    image: img('photo-1535131749006-b7f58c99034b'),
    gallery: [
      img('photo-1535131749006-b7f58c99034b'),
      img('photo-1551958219-acbc608c6377'),
      img('photo-1606925797300-0b35e9d1794e'),
    ],
    team: 'Real Madrid',
    season: '2024/25',
    player: '5',
    brand: 'Adidas',
    category: 'current',
    categoryLabel: 'Current Season',
    inStock: true,
  },
  {
    id: '7',
    slug: 'bayern-munich-2024-home',
    name: 'Bayern Munich 2024/25 Home',
    description:
      'The Rekordmeister in their signature red with diamond-tipped collar and specialised knitted back panel for breathability.',
    basePrice: 449,
    image: img('photo-1511886929837-354d827aae26'),
    gallery: [
      img('photo-1511886929837-354d827aae26'),
      img('photo-1606925797300-0b35e9d1794e'),
      img('photo-1577471488278-16eec37ffcc2'),
    ],
    team: 'Bayern Munich',
    season: '2024/25',
    brand: 'Adidas',
    category: 'current',
    categoryLabel: 'Current Season',
    inStock: true,
  },
  {
    id: '8',
    slug: 'portugal-2024-home',
    name: 'Portugal 2024 Home — Ronaldo #7',
    description:
      'A deep red shirt honouring the national team with the golden escudo and "A Seleção" calligraphy across the back.',
    basePrice: 449,
    image: img('photo-1518098268026-4e89f1a2cd8e'),
    gallery: [
      img('photo-1518098268026-4e89f1a2cd8e'),
      img('photo-1577471488278-16eec37ffcc2'),
      img('photo-1551958219-acbc608c6377'),
    ],
    team: 'Portugal',
    season: '2024',
    player: '7',
    brand: 'Nike',
    category: 'world-cup',
    categoryLabel: 'World Cup 2026',
    featured: true,
    inStock: true,
  },
  {
    id: '9',
    slug: 'chelsea-2024-home',
    name: 'Chelsea 2024/25 Home',
    description:
      'Chelsea royal blue with the club crest and a legacy-inspired geometric pattern. Lightweight engineered knit for all-day comfort.',
    basePrice: 449,
    image: img('photo-1517649763962-0c623066013b'),
    gallery: [
      img('photo-1517649763962-0c623066013b'),
      img('photo-1551958219-acbc608c6377'),
      img('photo-1606925797300-0b35e9d1794e'),
    ],
    team: 'Chelsea',
    season: '2024/25',
    brand: 'Nike',
    category: 'current',
    categoryLabel: 'Current Season',
    inStock: true,
  },
  {
    id: '10',
    slug: 'manchester-city-2024-home',
    name: 'Manchester City 2024/25 Home — Haaland #9',
    description:
      'Sky blue with an electric honeycomb texture honouring Manchester craft. Built with recycled materials and HEAT.RDY technology.',
    basePrice: 449,
    image: img('photo-1515886657613-9f3515b0c78f'),
    gallery: [
      img('photo-1515886657613-9f3515b0c78f'),
      img('photo-1606925797300-0b35e9d1794e'),
      img('photo-1551958219-acbc608c6377'),
    ],
    team: 'Manchester City',
    season: '2024/25',
    player: '9',
    brand: 'Puma',
    category: 'current',
    categoryLabel: 'Current Season',
    inStock: true,
  },
  {
    id: '11',
    slug: 'spain-2024-home',
    name: 'Spain 2024 Home',
    description:
      'A vibrant red shirt celebrating Spanish football with a modern wave graphic and the golden RFEF crest.',
    basePrice: 449,
    image: img('photo-1461896836934-ffe607ba8211'),
    gallery: [
      img('photo-1461896836934-ffe607ba8211'),
      img('photo-1614632537190-23e4146777db'),
      img('photo-1577471488278-16eec37ffcc2'),
    ],
    team: 'Spain',
    season: '2024',
    brand: 'Adidas',
    category: 'world-cup',
    categoryLabel: 'World Cup 2026',
    inStock: true,
  },
  {
    id: '12',
    slug: 'france-2024-home',
    name: 'France 2024 Home — Mbappé #10',
    description:
      'Les Bleus in deep navy with the golden rooster crest and elegant woven detailing. Proudly carrying the two stars of 2018 and 2022.',
    basePrice: 449,
    image: img('photo-1520975954732-35dd22299614'),
    gallery: [
      img('photo-1520975954732-35dd22299614'),
      img('photo-1577471488278-16eec37ffcc2'),
      img('photo-1551958219-acbc608c6377'),
    ],
    team: 'France',
    season: '2024',
    player: '10',
    brand: 'Nike',
    category: 'world-cup',
    categoryLabel: 'World Cup 2026',
    featured: true,
    inStock: true,
  },
];

export const CATEGORIES = [
  {
    slug: 'retro',
    title: 'Retro Classics',
    description: 'Iconic jerseys from 1990–2015',
    accent: 'from-red-500/80 to-orange-500/80',
    image: img('photo-1517466787929-bc90951d0974'),
  },
  {
    slug: 'current',
    title: 'Current Season',
    description: '2024/25 official kits',
    accent: 'from-blue-500/80 to-cyan-500/80',
    image: img('photo-1552346154-21d32810aba3'),
  },
  {
    slug: 'world-cup',
    title: 'World Cup 2026',
    description: 'National team collection',
    accent: 'from-emerald-500/80 to-green-500/80',
    image: img('photo-1522778119026-d647f0596c20'),
  },
] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}
