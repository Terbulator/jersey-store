'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';

export default function WishlistPage() {
  const { items, removeItem, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal mb-8 uppercase">Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-14 h-14 text-chrome/30 mx-auto mb-4" />
            <p className="text-sm text-chrome mb-1">Your wishlist is empty</p>
            <p className="text-xs text-chrome/60 mb-6">Save your favorite items for later.</p>
            <Link href="/shop" className="inline-block px-8 py-3 bg-blood-red text-off-white text-[11px] tracking-widest uppercase hover:bg-charcoal transition-colors">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((product) => (
              <div key={product.id} className="group">
                <Link href={`/shop/products/${product.slug}`} className="block">
                  <div className="relative aspect-[3/4] bg-white border border-charcoal/5 overflow-hidden mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-blood-red text-off-white text-[9px] tracking-widest uppercase">
                        {product.badge}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/shop/products/${product.slug}`}>
                      <h3 className="text-xs font-medium text-charcoal truncate hover:text-blood-red transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-chrome uppercase tracking-wider mt-0.5">
                      {product.edition === 'player' ? 'Player Version' : product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
                    </p>
                    <p className="text-xs font-bold text-charcoal mt-1">{formatPrice(product.basePrice)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-chrome hover:text-blood-red transition-colors flex-shrink-0"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    addItem(product, 'M');
                    openCart();
                  }}
                  className="w-full mt-2 py-2 border border-charcoal/15 text-[10px] tracking-widest uppercase text-charcoal hover:bg-charcoal hover:text-off-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
