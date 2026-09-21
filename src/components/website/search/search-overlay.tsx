'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '@/data/products';
import { formatPrice } from '@/lib/utils';

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
      setTimeout(() => inputRef.current?.focus(), 200);
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const results =
    query.length >= 2
      ? PRODUCTS.filter((p) => {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.team.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.edition.toLowerCase().includes(q)
          );
        }).slice(0, 6)
      : [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative max-w-3xl mx-auto mt-[10vh] sm:mt-[14vh] px-4"
          >
            <div
              className="bg-off-white shadow-2xl border border-charcoal/8 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/8">
                <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal">Search</span>
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="text-chrome hover:text-charcoal transition-colors duration-200 p-1"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Search Input */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-charcoal/8">
                <Search className="w-5 h-5 text-chrome flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jerseys, teams, editions..."
                  className="flex-1 bg-transparent text-base text-charcoal outline-none placeholder:text-chrome"
                />
              </div>

              {/* Results */}
              <AnimatePresence mode="wait">
                {results.length > 0 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-h-[50vh] overflow-y-auto"
                  >
                    {results.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={`/shop/products/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal/4 transition-colors duration-200 group"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-14 object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-chrome uppercase tracking-[0.15em] mt-0.5">
                              {product.edition === 'player'
                                ? 'Player Version'
                                : product.edition === 'master'
                                ? 'Master Edition'
                                : 'Special Edition'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-charcoal flex-shrink-0">
                            {formatPrice(product.basePrice)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-chrome opacity-0 group-hover:opacity-100 transition-opacity duration-200" strokeWidth={1.5} />
                        </Link>
                      </motion.div>
                    ))}
                    <Link
                      href={`/shop?search=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-6 py-4 text-[10px] tracking-[0.15em] uppercase text-blood-red hover:bg-charcoal/4 transition-colors duration-200 border-t border-charcoal/6"
                    >
                      View all results
                      <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                    </Link>
                  </motion.div>
                )}

                {query.length >= 2 && results.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm text-chrome">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-chrome/50 mt-1.5">Try a different search term.</p>
                  </motion.div>
                )}

                {query.length < 2 && (
                  <motion.div
                    key="popular"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-6"
                  >
                    <p className="text-[10px] tracking-[0.15em] uppercase text-chrome mb-4 font-medium">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((hint, i) => (
                        <motion.button
                          key={hint}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => setQuery(hint)}
                          className="px-4 py-2.5 text-[11px] tracking-wider border border-charcoal/12 text-chrome hover:border-charcoal/30 hover:text-charcoal hover:bg-charcoal/4 transition-all duration-200"
                        >
                          {hint}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}