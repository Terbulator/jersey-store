'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/website/product/product-card';

const TAGS = ['Football', 'Cricket', 'Streetwear', 'Player', 'Master', 'Sale', 'New'];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.edition.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal uppercase">Search</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chrome" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jerseys, teams, categories..."
            className="w-full pl-11 pr-10 py-4 bg-white border border-charcoal/15 text-sm text-charcoal outline-none focus:border-blood-red transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-chrome hover:text-charcoal transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!query.trim() && (
          <div>
            <p className="text-[11px] tracking-widest uppercase text-chrome mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 border border-charcoal/20 text-[11px] tracking-widest uppercase text-charcoal hover:bg-charcoal hover:text-off-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && results.length > 0 && (
          <div>
            <p className="text-[11px] tracking-widest uppercase text-chrome mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-chrome mb-1">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-chrome/60">Try a different search term.</p>
          </div>
        )}
      </div>
    </section>
  );
}
