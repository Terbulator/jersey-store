'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '@/lib/products';

const TEAMS = [
  'All',
  'Barcelona',
  'Manchester United',
  'AC Milan',
  'Argentina',
  'Arsenal',
  'Real Madrid',
  'Bayern Munich',
  'Chelsea',
  'Manchester City',
  'Spain',
  'France',
  'Portugal',
];
const SEASONS = ['All', 'Retro', '2024/25', '2024', '2022'];

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get('q') ?? '');
  const [team, setTeam] = useState('All');
  const [season, setSeason] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams?.get('q') ?? '';
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (team !== 'All' && p.team !== team) return false;
      if (season !== 'All') {
        if (season === 'Retro') {
          if (p.category !== 'retro') return false;
        } else if (p.season !== season) {
          return false;
        }
      }
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
                aria-label="Clear search"
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
