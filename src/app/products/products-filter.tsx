'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/products';
import { useCart } from '@/store/cart';

interface Props {
  products: Product[];
  teams: string[];
  categories: string[];
}

export function ProductsFilter({ products, teams, categories }: Props) {
  const searchParams = useSearchParams();
  const setReferral = useCart((s) => s.setReferral);
  const [search, setSearch] = useState(searchParams?.get('q') ?? '');
  const [team, setTeam] = useState('All');
  const [category, setCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams?.get('q') ?? '';
    if (q) setSearch(q);
    const ref = searchParams?.get('ref')?.trim() ?? '';
    if (ref) setReferral(ref.toUpperCase());
  }, [searchParams, setReferral]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (team !== 'All' && p.team !== team) return false;
      if (category !== 'All' && p.category !== category) return false;
      return true;
    });
  }, [search, team, category, products]);

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">All Jerseys</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} products</p>
      </div>

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
        <aside className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Team</h3>
                <div className="space-y-1">
                  {teams.map((t) => (
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
                <h3 className="text-sm font-semibold mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={category === 'All' ? 'default' : 'outline'}
                    onClick={() => setCategory('All')}
                    className="cursor-pointer"
                  >
                    All
                  </Badge>
                  {categories.map((c) => (
                    <Badge
                      key={c}
                      variant={category === c ? 'default' : 'outline'}
                      onClick={() => setCategory(c)}
                      className="cursor-pointer"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              {(team !== 'All' || category !== 'All' || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTeam('All');
                    setCategory('All');
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
  );
}
