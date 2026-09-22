'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PRODUCTS, CATEGORIES, EDITION_TYPES } from '@/data/products';
import { ProductGrid } from '@/components/website/product/product-grid';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
];

const TEAMS = [...new Set(PRODUCTS.map((p) => p.team))];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export function ShopTemplate({
  title,
  description,
  defaultCategory = 'all',
}: {
  title: string;
  description: string;
  defaultCategory?: string;
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || defaultCategory;

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeEdition, setActiveEdition] = useState('');
  const [activeTeam, setActiveTeam] = useState('');
  const [activeSize, setActiveSize] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filteredProducts = useMemo(() => {
    let items = [...PRODUCTS];

    if (activeCategory !== 'all') {
      items = items.filter((p) => p.category === activeCategory);
    }
    if (activeEdition) {
      items = items.filter((p) => p.edition === activeEdition);
    }
    if (activeTeam) {
      items = items.filter((p) => p.team === activeTeam);
    }
    if (activeSize) {
      items = items.filter((p) => p.sizes?.includes(activeSize));
    }

    switch (sortBy) {
      case 'newest':
        items.reverse();
        break;
      case 'price-low':
        items.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        items.sort((a, b) => b.basePrice - a.basePrice);
        break;
    }

    return items;
  }, [activeCategory, activeEdition, activeTeam, activeSize, sortBy]);

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveEdition('');
    setActiveTeam('');
    setActiveSize('');
    setSortBy('featured');
  };

  const activeFilterCount = [activeEdition, activeTeam, activeSize].filter(Boolean).length;

  const categoryTabs =
    defaultCategory === 'all'
      ? [{ id: 'all', label: 'ALL' }, ...CATEGORIES.map((c) => ({ id: c.slug, label: c.name.toUpperCase() }))]
      : null;

  return (
    <>
      {/* Header */}
      <section className="pt-40 sm:pt-48 pb-12 sm:pb-16 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-black">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="mb-12"
        >
          <p className="eyebrow">The Collection</p>
          <h1 className="headline text-4xl sm:text-5xl lg:text-6xl text-off-white mt-3">
            {title}
          </h1>
          <p className="text-sm text-off-white/60 mt-3 tracking-wide max-w-lg">
            {description}
          </p>
        </motion.div>

        {categoryTabs && (
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-4 py-2 text-[10px] font-mono-meta tracking-widest whitespace-nowrap rounded-full border transition-colors',
                  activeCategory === cat.id
                    ? 'border-off-white text-off-white bg-off-white/10'
                    : 'border-white/15 text-off-white/60 hover:border-off-white/50 hover:text-off-white'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-[10px] font-mono-meta tracking-widest rounded-full border transition-colors',
                activeFilterCount > 0
                  ? 'border-red text-off-white bg-red/10'
                  : 'border-white/15 text-off-white/60 hover:border-off-white/50 hover:text-off-white'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-red text-off-white text-[9px] rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-mono-meta text-off-white/70 hover:text-red tracking-wider underline underline-offset-4"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono-meta tracking-widest rounded-full border border-white/15 text-off-white/60 hover:border-off-white/50 hover:text-off-white transition-colors"
            >
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <ChevronDown
                className={cn('w-3 h-3 transition-transform', showSort && 'rotate-180')}
              />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-charcoal border border-white/10 rounded-xl shadow-xl min-w-[200px] overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSort(false);
                      }}
                      className={cn(
                        'block w-full text-left px-4 py-2.5 text-xs tracking-wider transition-colors',
                        sortBy === option.value
                          ? 'text-off-white bg-white/10'
                          : 'text-off-white/60 hover:bg-white/5'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="font-mono-meta text-[9px] text-off-white/40 tracking-wider uppercase mb-4">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </section>

      {/* Product Grid */}
      <section className="pb-20 sm:pb-28 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${activeEdition}-${activeTeam}-${activeSize}-${sortBy}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE_PREMIUM }}
          >
            <ProductGrid products={filteredProducts} />
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-off-white/60">No products match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-[10px] font-mono-meta tracking-widest uppercase text-red hover:underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[60]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: EASE_PREMIUM }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-charcoal shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
                <h2 className="headline text-xl text-off-white">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-off-white/60 hover:text-off-white transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/50 mb-3">
                    Edition
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {EDITION_TYPES.map((ed) => (
                      <button
                        key={ed.id}
                        onClick={() => {
                          const val = activeEdition === ed.id ? '' : ed.id;
                          setActiveEdition(val);
                        }}
                        className={cn(
                          'px-3.5 py-1.5 text-[11px] border rounded-full transition-colors',
                          activeEdition === ed.id
                            ? 'border-red text-off-white bg-red/10'
                            : 'border-white/15 text-off-white/60 hover:border-off-white/50'
                        )}
                      >
                        {ed.icon} {ed.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/50 mb-3">
                    Team
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {TEAMS.map((team) => (
                      <button
                        key={team}
                        onClick={() => {
                          const val = activeTeam === team ? '' : team;
                          setActiveTeam(val);
                        }}
                        className={cn(
                          'px-3.5 py-1.5 text-[11px] border rounded-full transition-colors',
                          activeTeam === team
                            ? 'border-red text-off-white bg-red/10'
                            : 'border-white/15 text-off-white/60 hover:border-off-white/50'
                        )}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/50 mb-3">
                    Size
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          const val = activeSize === size ? '' : size;
                          setActiveSize(val);
                        }}
                        className={cn(
                          'w-11 h-11 text-[11px] rounded-full border transition-colors',
                          activeSize === size
                            ? 'border-red bg-red text-off-white'
                            : 'border-white/15 text-off-white/60 hover:border-off-white/50'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-8">
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-pill btn-pill-solid w-full"
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ShopPageShell({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}>{children}</Suspense>;
}