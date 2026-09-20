'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { formatPrice, cn } from '@/lib/utils';

const POPULAR_SEARCHES = [
  'Football', 'Brazil', 'Argentina', 'Real Madrid', 'Barcelona',
  'Player Version', 'Master Edition', 'Cricket', 'IPL', 'Streetwear',
];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const results = query.length >= 2
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.edition.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="relative max-w-2xl mx-auto mt-[10vh] sm:mt-[15vh] mx-4 sm:mx-auto">
        <div
          className="bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-charcoal/10">
            <Search className="w-4 h-4 text-chrome flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jerseys, teams, editions..."
              className="flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-chrome"
            />
            <button onClick={onClose} aria-label="Close search" className="text-chrome hover:text-charcoal transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-[50vh] overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-off-white transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-14 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal truncate">{product.name}</p>
                    <p className="text-[10px] text-chrome uppercase tracking-wider">
                      {product.edition === 'player' ? 'Player Version' : product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-charcoal flex-shrink-0">{formatPrice(product.basePrice)}</span>
                </Link>
              ))}
              <Link
                href={`/shop?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="block px-5 py-3 text-[11px] tracking-widest uppercase text-blood-red hover:bg-off-white transition-colors border-t border-charcoal/5"
              >
                View all results for &ldquo;{query}&rdquo;
              </Link>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && results.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-chrome">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-chrome/60 mt-1">Try a different search term.</p>
            </div>
          )}

          {/* Popular Searches (shown when no query) */}
          {query.length < 2 && (
            <div className="px-5 py-4">
              <p className="text-[10px] tracking-widest uppercase text-chrome mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setQuery(hint)}
                    className="px-3 py-1.5 text-[11px] tracking-wider border border-charcoal/15 text-chrome hover:border-charcoal/40 hover:text-charcoal transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
