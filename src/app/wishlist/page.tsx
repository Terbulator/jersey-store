'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice, ROUTES } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';

function editionLabel(product: { edition?: string }) {
  if (product.edition === 'player') return 'Player Version';
  if (product.edition === 'master') return 'Master Edition';
  return 'Special Edition';
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  return (
    <section className="min-h-screen bg-black text-off-white px-6 sm:px-8 lg:px-12 pt-28 lg:pt-32 pb-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-[680px] mb-12">
          <p className="font-mono-meta text-[10px] text-off-white/40 mb-6">HEADERR.</p>
          <h1 className="font-display text-5xl sm:text-7xl text-off-white leading-[0.95]">
            YOUR WISHLIST.
          </h1>
          <p className="font-mono-meta text-[10px] text-off-white/45 mt-6 leading-[2]">
            SAVE THE JERSEYS YOU WANT TO COME BACK TO.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-off-white/10">
            <Heart className="w-12 h-12 text-off-white/25 mx-auto mb-6" strokeWidth={1} />
            <p className="headline text-3xl text-off-white mb-2">NOTHING HERE YET.</p>
            <p className="font-mono-meta text-[10px] text-off-white/45 mb-10">
              TAP THE HEART ON ANY JERSEY TO SAVE IT HERE.
            </p>
            <Link href={ROUTES.SHOP} className="btn-pill btn-pill-solid">
              Explore the Drop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {items.map((product) => (
              <div key={product.id} className="group">
                <Link
                  href={`/shop/products/${product.slug}`}
                  className="block relative aspect-[3/4] bg-off-white overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 font-mono-meta text-[9px] px-2.5 py-1 bg-red text-white">
                      {product.badge}
                    </span>
                  )}
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(product.id);
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-[#B3001B]"
                  >
                    <Heart className="w-4 h-4" strokeWidth={1.5} fill="currentColor" />
                  </motion.button>
                </Link>

                <div className="pt-3.5 px-0.5">
                  <Link href={`/shop/products/${product.slug}`}>
                    <h3 className="headline text-lg sm:text-xl text-off-white leading-tight hover:text-red transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-mono-meta text-[9px] text-off-white/40 mt-1.5">
                    {editionLabel(product)}
                  </p>
                  <p className="text-[15px] text-off-white/90 mt-1.5">
                    {formatPrice(product.basePrice)}
                  </p>

                  <button
                    onClick={() => {
                      addItem(product, product.sizes[0]);
                      openCart();
                    }}
                    className="w-full mt-3 py-3 flex items-center justify-center gap-2 btn-pill btn-pill-outline h-11"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}