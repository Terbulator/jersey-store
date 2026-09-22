'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PRODUCTS, CATEGORIES, EDITION_TYPES } from '@/data/products';
import { ProductCard } from '@/components/website/product/product-card';
import { CategoryMosaic } from '@/components/website/categories/category-mosaic';
import { FeaturedDrop } from '@/components/website/hero/featured-drop';
import { productGridStagger } from '@/components/motion/motion-variants';
import { ROUTES } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { fadeUpSmall, clipReveal, EASE_PREMIUM } from '@/components/motion/motion-variants';

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

function ShopPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

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

  const { ref, isVisible } = useScrollReveal({ rootMargin: '-100px' });

  return (
    <>
      {/* Category Mosaic */}
      <CategoryMosaic />

      {/* Shop Header with Filters */}
      <section ref={ref} className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-navy">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-off-white uppercase">
            THE FULL COLLECTION
          </h1>
          <p className="text-sm text-sage mt-2 tracking-wide max-w-lg">
            Football, Cricket, Streetwear. Player Version, Master Edition, Special Edition.
          </p>
        </motion.div>

        {/* Category Nav */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1, duration: 0.6, ease: EASE_PREMIUM }}
          className="mb-8"
        >
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
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-olive/20 text-sage hover:border-gold/40 hover:text-gold'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filter + Sort Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE_PREMIUM }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-[11px] tracking-widest uppercase border transition-colors',
                activeFilterCount > 0
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-olive/20 text-sage hover:border-gold/40'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-gold text-navy text-[9px] rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] text-gold tracking-wider hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 text-[11px] tracking-widest uppercase border border-olive/20 text-sage hover:border-gold/40 transition-colors"
            >
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <ChevronDown className={cn('w-3 h-3 transition-transform', showSort && 'rotate-180')} />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-navy border border-olive/20 shadow-lg min-w-[180px]">
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
                          ? 'text-gold bg-gold/10'
                          : 'text-sage hover:bg-olive/10'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Product Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xs text-sage/60 tracking-wider uppercase mb-8"
        >
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </motion.p>
      </section>

      {/* Product Grid */}
      <section className="py-16 sm:py-24 lg:py-32 px-6 sm:px-8 lg:px-12 max-w-[1400px] mx-auto bg-navy">
        <motion.div
          variants={productGridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="product-grid"
        >
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              custom={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="text-center py-16"
          >
            <p className="text-sage">No products match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-xs tracking-widest uppercase text-gold hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        {/* Featured Drop at bottom of shop */}
        <div className="mt-20 lg:mt-32">
          <FeaturedDrop />
        </div>
      </section>

      {/* Filter Drawer (Mobile + Desktop) */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-navy shadow-xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-olive/10">
              <h2 className="text-sm font-bold tracking-widest uppercase text-off-white">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-1 text-sage hover:text-gold transition-colors">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Edition */}
              <div>
                <h3 className="text-[11px] tracking-widest uppercase text-gold mb-3">Edition</h3>
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
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-olive/20 text-sage hover:border-gold/40'
                      )}
                    >
                      {ed.icon} {ed.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team */}
              <div>
                <h3 className="text-[11px] tracking-widest uppercase text-gold mb-3">Team</h3>
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
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-olive/20 text-sage hover:border-gold/40'
                      )}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-[11px] tracking-widest uppercase text-gold mb-3">Size</h3>
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
                          ? 'border-gold bg-gold text-navy'
                          : 'border-olive/20 text-sage hover:border-gold/40'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-olive/10">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-gold text-navy text-[11px] tracking-widest uppercase hover:bg-bronze transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-8" />}>
      <ShopPageContent />
    </Suspense>
  );
}