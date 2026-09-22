'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PRODUCTS } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { metaLine, editionLabel } from '@/lib/catalog';

const TAGS = ['Football', 'Cricket', 'Streetwear', 'Player', 'Master', 'Sale', 'New'];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUiStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
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
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[55] bg-black/95 backdrop-blur-md flex flex-col"
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
            <span className="font-mono-meta text-[10px] text-off-white/50">Search</span>
            <button
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="p-2 text-off-white/70 hover:text-off-white"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 flex-1 overflow-y-auto">
            <motion.input
              ref={inputRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jerseys, teams, editions…"
              className="w-full bg-transparent border-b border-white/20 focus:border-off-white outline-none py-4 text-2xl sm:text-3xl headline text-off-white placeholder:text-off-white/30 transition-colors"
            />

            {!query.trim() ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-10"
              >
                <p className="font-mono-meta text-[10px] text-off-white/40 mb-4">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-4 py-2 rounded-full border border-white/15 text-[11px] font-mono-meta text-off-white/70 hover:border-off-white hover:text-off-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : results.length > 0 ? (
              <div className="mt-8">
                <p className="font-mono-meta text-[10px] text-off-white/40 mb-4">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={`/shop/products/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-14 h-16 bg-white/5 shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={p.image}
                            alt={p.imageAlt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="headline text-lg text-off-white leading-tight">
                            {p.name}
                          </p>
                          <p className="font-mono-meta text-[9px] text-off-white/40 mt-1">
                            {metaLine(p)} · {editionLabel(p.edition)}
                          </p>
                          <p className="text-sm text-off-white/70 mt-0.5">
                            {formatPrice(p.basePrice)}
                          </p>
                        </div>
                        <ArrowRight
                          className="ml-auto w-4 h-4 text-off-white/30 group-hover:text-off-white transition-colors"
                          strokeWidth={1.5}
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-10 text-sm text-off-white/50">
                No results for &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}