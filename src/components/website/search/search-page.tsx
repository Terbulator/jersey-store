'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Edition, Product } from '@/lib/storefront-types';
import { ProductGrid } from '@/components/website/product/product-grid';

const TAGS = ['Football', 'Cricket', 'Streetwear', 'Player', 'Master', 'Sale', 'New'];

export function SearchPageClient({
  products,
  editions,
}: {
  products: Product[];
  editions: Edition[];
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.team ?? '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.edition.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
  }, [products, query]);

  return (
    <section className="pt-36 sm:pt-44 pb-20 sm:pb-28 px-6 sm:px-8 lg:px-12 bg-black min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10">
          <p className="eyebrow">Search</p>
          <h1 className="headline text-4xl sm:text-5xl text-off-white mt-3">
            Find your kit.
          </h1>
        </div>

        <div className="relative mb-10 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-off-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jerseys, teams, editions…"
            className="w-full pl-11 pr-10 py-4 bg-charcoal border border-white/10 rounded-full text-sm text-off-white placeholder:text-off-white/30 outline-none focus:border-off-white/40 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-off-white/50 hover:text-off-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!query.trim() && (
          <div className="mb-10">
            <p className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/40 mb-3">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 rounded-full border border-white/15 text-[11px] font-mono-meta text-off-white/60 hover:border-off-white hover:text-off-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && results.length > 0 && (
          <div>
            <p className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/40 mb-6">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <ProductGrid products={results} editions={editions} />
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-off-white/60 mb-1">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-off-white/30">Try a different search term.</p>
          </div>
        )}
      </div>
    </section>
  );
}