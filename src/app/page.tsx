import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { ProductCard, ProductCardData } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw } from 'lucide-react';

// Lazy load 3D scene (client-only)
const HeroScene = dynamic(
  () => import('@/components/3d/hero-scene').then((m) => m.HeroScene),
  { ssr: false }
);

// Mock data — replace with Sanity/Prisma queries
const featuredProducts: ProductCardData[] = [
  {
    id: '1',
    slug: 'barcelona-2015-messi-home',
    name: 'Barcelona 2014/15 Home — Messi #10',
    basePrice: 449,
    comparePrice: 599,
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80',
    team: 'Barcelona',
    season: '2014/15',
    player: '10',
    featured: true,
  },
  {
    id: '2',
    slug: 'manchester-united-2008-ronaldo',
    name: 'Manchester United 2007/08 Home — Ronaldo #7',
    basePrice: 449,
    comparePrice: 599,
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
    team: 'Manchester United',
    season: '2007/08',
    player: '7',
    featured: true,
  },
  {
    id: '3',
    slug: 'ac-milan-2006-ibrahimovic',
    name: 'AC Milan 2006/07 Home — Ibrahimović #9',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    team: 'AC Milan',
    season: '2006/07',
    player: '9',
  },
  {
    id: '4',
    slug: 'argentina-2022-world-cup',
    name: 'Argentina 2022 World Cup — Messi #10',
    basePrice: 549,
    image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80',
    team: 'Argentina',
    season: '2022',
    player: '10',
    featured: true,
  },
  {
    id: '5',
    slug: 'arsenal-2024-home',
    name: 'Arsenal 2024/25 Home',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1602674809970-1d8a2c4d6c8e?w=800&q=80',
    team: 'Arsenal',
    season: '2024/25',
  },
  {
    id: '6',
    slug: 'real-madrid-2024-home',
    name: 'Real Madrid 2024/25 Home — Bellingham #5',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    team: 'Real Madrid',
    season: '2024/25',
    player: '5',
  },
  {
    id: '7',
    slug: 'bayern-munich-2024-home',
    name: 'Bayern Munich 2024/25 Home',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
    team: 'Bayern Munich',
    season: '2024/25',
  },
  {
    id: '8',
    slug: 'portugal-2024-home',
    name: 'Portugal 2024 Home — Ronaldo #7',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80',
    team: 'Portugal',
    season: '2024',
    player: '7',
  },
];

const categories = [
  {
    title: 'Retro Classics',
    description: 'Iconic jerseys from 1990–2015',
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&q=80',
    href: '/categories/retro',
    accent: 'from-red-500/80 to-orange-500/80',
  },
  {
    title: 'Current Season',
    description: '2024/25 official kits',
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600&q=80',
    href: '/categories/current',
    accent: 'from-blue-500/80 to-cyan-500/80',
  },
  {
    title: 'World Cup 2026',
    description: 'National team collection',
    image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600&q=80',
    href: '/categories/world-cup',
    accent: 'from-emerald-500/80 to-green-500/80',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <CartDrawer />

      <main>
        {/* ---------------- HERO with 3D ---------------- */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-pitch-50/20 to-background dark:via-pitch-900/10">
          <div className="container grid lg:grid-cols-2 gap-8 py-12 lg:py-20">
            <div className="flex flex-col justify-center space-y-6 animate-fade-in">
              <Badge variant="success" className="w-fit gap-1.5">
                <Sparkles className="h-3 w-3" />
                New 3D Preview Experience
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Wear the <span className="gradient-text">Legends</span>.
                <br />
                Live the <span className="gradient-text">Game</span>.
              </h1>
              <p className="max-w-md text-lg text-muted-foreground">
                Premium retro and current football jerseys. Inspect every detail with our
                interactive 3D viewer before you buy.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="xl" variant="glow">
                  <Link href="/products">
                    Shop Jerseys <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link href="/categories/retro">Explore Retro</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { icon: Truck, label: 'Free Shipping' },
                  { icon: Shield, label: 'Authentic' },
                  { icon: RotateCcw, label: 'Easy Returns' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:gap-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium mt-1 sm:mt-0">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
              <HeroScene className="absolute inset-0" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-l" />
            </div>
          </div>
        </section>

        {/* ---------------- CATEGORIES ---------------- */}
        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Shop by Collection</h2>
              <p className="text-muted-foreground mt-1">Browse our curated jersey categories</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/products">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent}`} />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold">{cat.title}</h3>
                  <p className="text-sm text-white/90">{cat.description}</p>
                  <div className="mt-3 flex items-center text-sm font-semibold">
                    Shop now <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------- FEATURED PRODUCTS ---------------- */}
        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Jerseys</h2>
              <p className="text-muted-foreground mt-1">Hand-picked by football fans</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/products">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ---------------- 3D CTA ---------------- */}
        <section className="container py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pitch-700 to-pitch-900 p-8 md:p-12">
            <div className="relative z-10 max-w-2xl space-y-4 text-white">
              <Badge variant="outline" className="border-white/30 text-white">
                Powered by Three.js
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Inspect every stitch in 3D
              </h2>
              <p className="text-lg text-white/80">
                Rotate, zoom, and explore each jersey from every angle. Switch colors, see
                patches, and visualize the fit — all in real time.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/products/barcelona-2015-messi-home">
                  Try the 3D viewer <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none">
              <HeroScene />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
