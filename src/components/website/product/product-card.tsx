'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { metaLine } from '@/lib/catalog';
import type { Product } from '@/data/products';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const secondImage = product.images?.[1];

  return (
    <div className="group">
      <Link
        href={`/shop/products/${product.slug}`}
        className="block relative aspect-[3/4] bg-off-white overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.imageAlt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {secondImage && (
          <img
            src={secondImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {product.badge && (
          <span
            className={cn(
              'absolute top-3 left-3 font-mono-meta text-[9px] px-2.5 py-1',
              product.badge === 'NEW' && 'bg-red text-white',
              product.badge === 'SALE' && 'bg-black text-off-white',
              product.badge === 'LIMITED' && 'bg-off-white text-black border border-black/10'
            )}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-black hover:scale-110 transition-transform"
        >
          <Heart
            className="w-4 h-4"
            strokeWidth={1.5}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product, product.sizes[0]);
            openCart();
          }}
          className="absolute bottom-3 left-3 right-3 btn-pill btn-pill-dark opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 h-11"
        >
          Quick Add
        </button>
      </Link>

      <div className="pt-3.5 px-0.5">
        <p className="font-mono-meta text-[9px] text-chrome">{metaLine(product)}</p>
        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="headline text-lg sm:text-xl text-navy mt-1.5 leading-tight">
            {product.name}
          </h3>
        </Link>
        <p className="text-[13px] text-chrome mt-1 leading-relaxed line-clamp-1">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[15px] text-navy font-medium">{formatPrice(product.basePrice)}</span>
          {product.comparePrice && product.comparePrice > product.basePrice && (
            <span className="text-xs text-chrome line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}