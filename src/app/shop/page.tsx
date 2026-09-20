'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCTS, CATEGORIES, EDITION_TYPES } from '@/data/products';
import { ProductCard } from '@/components/website/product/product-card';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
];

const ALL_FILTER_CATEGORIES = [
  { id: 'all', label: 'ALL' },
  ...CATEGORIES.map((c) => ({ id: c.slug, label: c.name.toUpperCase() })),
];

const TEAMS = [...new Set(PRODUCTS.map((p) => p.team))];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ShopPage() {

  const [activeCategory, setActiveCategory] = useState('all');
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

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Shop Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal uppercase">Shop</h1>
          <p className="text-sm text-chrome mt-2 tracking-wide">
            The HEADERR Collection — Football, Cricket, Streetwear.
          </p>
        </div>

        {/* Category Nav */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar mb-6 pb-1">
          {ALL_FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
              className={cn(
                'px-4 py-2 text-[11px] tracking-widest uppercase whitespace-nowrap border transition-all duration-200',
                activeCategory === cat.id
                  ? 'border-blood-red text-blood-red bg-blood-red/5'
                  : 'border-charcoal/15 text-chrome hover:border-charcoal/40 hover:text-charcoal'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter + Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-[11px] tracking-widest uppercase border transition-colors',
                activeFilterCount > 0
                  ? 'border-blood-red text-blood-red'
                  : 'border-charcoal/15 text-chrome hover:border-charcoal/40'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-blood-red text-off-white text-[9px] rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] text-blood-red tracking-wider hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 text-[11px] tracking-widest uppercase border border-charcoal/15 text-chrome hover:border-charcoal/40 transition-colors"
            >
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <ChevronDown className={cn('w-3 h-3 transition-transform', showSort && 'rotate-180')} />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-charcoal/10 shadow-lg min-w-[180px]">
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
                          ? 'text-blood-red bg-blood-red/5'
                          : 'text-charcoal hover:bg-off-white'
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

        {/* Product Count */}
        <p className="text-xs text-chrome tracking-wider uppercase mb-4">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm text-chrome mb-4">No products found.</p>
            <button
              onClick={clearFilters}
              className="text-xs tracking-widest uppercase text-blood-red hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer (Mobile + Desktop) */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowFilters(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-charcoal/10">
              <h2 className="text-sm font-bold tracking-widest uppercase">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-1 hover:text-blood-red transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Edition */}
              <div>
                <h3 className="text-[11px] tracking-widest uppercase text-chrome mb-3">Edition</h3>
                <div className="flex flex-wrap gap-2">
                  {EDITION_TYPES.map((ed) => (
                    <button
                      key={ed.id}
                      onClick={() => {
                        const val = activeEdition === ed.id ? '' : ed.id;
                        setActiveEdition(val);
                      }}
                      className={cn(
                        'px-3 py-1.5 text-[11px] tracking-wider border transition-colors',
                        activeEdition === ed.id
                          ? 'border-blood-red text-blood-red bg-blood-red/5'
                          : 'border-charcoal/15 text-chrome hover:border-charcoal/40'
                      )}
                    >
                      {ed.icon} {ed.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team */}
              <div>
                <h3 className="text-[11px] tracking-widest uppercase text-chrome mb-3">Team</h3>
                <div className="flex flex-wrap gap-2">
                  {TEAMS.map((team) => (
                    <button
                      key={team}
                      onClick={() => {
                        const val = activeTeam === team ? '' : team;
                        setActiveTeam(val);
                      }}
                      className={cn(
                        'px-3 py-1.5 text-[11px] tracking-wider border transition-colors',
                        activeTeam === team
                          ? 'border-blood-red text-blood-red bg-blood-red/5'
                          : 'border-charcoal/15 text-chrome hover:border-charcoal/40'
                      )}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-[11px] tracking-widest uppercase text-chrome mb-3">Size</h3>
                <div className="flex gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        const val = activeSize === size ? '' : size;
                        setActiveSize(val);
                      }}
                      className={cn(
                        'w-10 h-10 text-[11px] tracking-wider border transition-colors',
                        activeSize === size
                          ? 'border-blood-red bg-blood-red text-off-white'
                          : 'border-charcoal/20 text-charcoal hover:border-charcoal'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply (mobile UX) */}
            <div className="p-4 border-t border-charcoal/10">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
