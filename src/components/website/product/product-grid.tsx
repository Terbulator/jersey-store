'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './product-card';
import type { Edition, Product } from '@/lib/storefront-types';

export function ProductGrid({
  products,
  editions,
  columns,
}: {
  products: Product[];
  editions: Edition[];
  columns?: { mobile?: number; desktop?: number };
}) {
  const m = columns?.mobile === 1 ? 1 : 2;
  const d = columns?.desktop === 2 ? 2 : columns?.desktop === 3 ? 3 : 4;
  const cls = `grid ${m === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${
    d === 2 ? 'md:grid-cols-2 lg:grid-cols-2' : d === 3 ? 'md:grid-cols-3 lg:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'
  } gap-x-4 gap-y-10 sm:gap-x-5`;
  return (
    <div className={cls}>
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: (i % 4) * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductCard product={product} editions={editions} />
        </motion.div>
      ))}
    </div>
  );
}