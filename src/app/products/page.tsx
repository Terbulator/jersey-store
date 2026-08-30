'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { ProductCard, ProductCardData } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_PRODUCTS: ProductCardData[] = [
  {
    id: '1', slug: 'barcelona-2015-messi-home',
    name: 'Barcelona 2014/15 Home — Messi #10',
    basePrice: 449, comparePrice: 599,
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80',
    team: 'Barcelona', season: '2014/15', player: '10', featured: true,
  },
  {
    id: '2', slug: 'manchester-united-2008-ronaldo',
    name: 'Manchester United 2007/08 Home — Ronaldo #7',
    basePrice: 449, comparePrice: 599,
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
    team: 'Manchester United', season: '2007/08', player: '7', featured: true,
  },
  {
    id: '3', slug: 'ac-milan-2006-ibrahimovic',
    name: 'AC Milan 2006/07 Home — Ibrahimović #9',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    team: 'AC Milan', season: '2006/07', player: '9',
  },
  {
    id: '4', slug: 'argentina-2022-world-cup',
    name: 'Argentina 2022 World Cup — Messi #10',
    basePrice: 549,
    image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80',
    team: 'Argentina', season: '2022', player: '10', featured: true,
  },
  {
    id: '5', slug: 'arsenal-2024-home',
    name: 'Arsenal 2024/25 Home',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1602674809970-1d8a2c4d6c8e?w=800&q=80',
    team: 'Arsenal', season: '2024/25',
  },
  {
    id: '6', slug: 'real-madrid-2024-home',
    name: 'Real Madrid 2024/25 Home — Bellingham #5',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    team: 'Real Madrid', season: '2024/25', player: '5',
  },
  {
    id: '7', slug: 'bayern-munich-2024-home',
    name: 'Bayern Munich 2024/25 Home',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
    team: 'Bayern Munich', season: '2024/25',
  },
  {
    id: '8', slug: 'portugal-2024-home',
    name: 'Portugal 2024 Home — Ronaldo #7',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80',
    team: 'Portugal', season: '2024', player: '7',
  },
  {
    id: '9', slug: 'chelsea-2024-home',
    name: 'Chelsea 2024/25 Home',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    team: 'Chelsea', season: '2024/25',
  },
  {
    id: '10', slug: 'manchester-city-2024-home',
    name: 'Manchester City 2024/25 Home — Haaland #9',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
    team: 'Manchester City', season: '2024/25', player: '9',
  },
  {
    id: '11', slug: 'spain-2024-home',
    name: 'Spain 2024 Home',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80',
    team: 'Spain', season: '2024',
  },
  {
    id: '12', slug: 'france-2024-home',
    name: 'France 2024 Home — Mbappé #10',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80',
    team: 'France', season: '2024', player: '10',
  },
];

const TEAMS = ['All', 'Barcelona', 'Manchester United', 'AC Milan', 'Argentina', 'Arsenal', 'Real Madrid', 'Bayern Munich'];
const SEASONS = ['All', 'Retro', '2024/25', '2024', '2022'];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [season, setSeason] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (team !== 'All' && p.team !== team) return false;
      if (season !== 'All' && p.season !== season) return false;
      return true;
    });
  }, [search, team, season]);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">All Jerseys</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} products</p>
        </div>

        {/* Search + filter toggle */}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jerseys, teams, players…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside
            className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Team</h3>
                  <div className="space-y-1">
                    {TEAMS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTeam(t)}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                          team === t
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Season</h3>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map((s) => (
                      <Badge
                        key={s}
                        variant={season === s ? 'default' : 'outline'}
                        onClick={() => setSeason(s)}
                        className="cursor-pointer"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {(team !== 'All' || season !== 'All' || search) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTeam('All');
                      setSeason('All');
                      setSearch('');
                    }}
                    className="w-full"
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Product grid */}
          <div>
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-semibold">No jerseys found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <AnimatePresence>
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
