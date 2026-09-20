'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  const secondImage = product.images?.[1];

  const handleQuickAdd = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setShowQuickAdd(false);
      setSelectedSize('');
      openCart();
    }, 800);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (!showQuickAdd) setShowQuickAdd(false);
      }}
    >
      <Link href={`/shop/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-off-white">
          {/* Skeleton placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-charcoal/4 animate-pulse" />
          )}

          {/* Primary Image */}
          <img
            src={product.image}
            alt={product.imageAlt || product.name}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out',
              hovered && secondImage ? 'opacity-0 scale-100' : 'opacity-100 scale-100',
              !hovered && 'group-hover:scale-[1.03]'
            )}
          />
          {/* Second Image — crossfade */}
          {secondImage && (
            <img
              src={secondImage}
              alt={`${product.name} alternate view`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out',
                hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
              )}
            />
          )}
          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-blood-red text-off-white text-[9px] tracking-[0.15em] uppercase font-medium">
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={cn(
          'absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300',
          isWishlisted
            ? 'text-blood-red opacity-100'
            : 'text-charcoal/40 opacity-0 group-hover:opacity-100 hover:text-blood-red'
        )}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} strokeWidth={1.5} />
      </button>

      {/* Product Info */}
      <div className="mt-3">
        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-charcoal tracking-wide truncate group-hover:text-blood-red transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] text-chrome tracking-[0.12em] uppercase mt-0.5">
          {product.edition === 'player'
            ? 'Player Version'
            : product.edition === 'master'
              ? 'Master Edition'
              : 'Special Edition'}
        </p>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-sm font-bold text-charcoal">{formatPrice(product.basePrice)}</span>
          {product.comparePrice && (
            <span className="text-xs text-chrome line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>

      {/* Quick Add */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white border-t border-charcoal/8 transition-all duration-300 overflow-hidden',
          showQuickAdd ? 'max-h-44 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-11 group-hover:opacity-100'
        )}
      >
        {!showQuickAdd ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickAdd(true);
            }}
            className="w-full py-3 text-[10px] tracking-[0.15em] uppercase text-charcoal hover:text-blood-red transition-colors duration-200"
          >
            Quick Add
          </button>
        ) : (
          <div className="p-3 space-y-2">
            <div className="flex gap-1.5">
              {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'flex-1 py-1.5 text-[10px] tracking-wider border transition-all duration-200',
                    selectedSize === size
                      ? 'border-blood-red bg-blood-red text-off-white'
                      : 'border-charcoal/15 text-charcoal hover:border-charcoal/40'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleQuickAdd();
              }}
              disabled={!selectedSize || added}
              className={cn(
                'w-full py-2.5 text-[10px] tracking-[0.15em] uppercase transition-all duration-300',
                added
                  ? 'bg-green-600 text-white'
                  : selectedSize
                    ? 'bg-blood-red text-off-white hover:bg-charcoal'
                    : 'bg-charcoal/8 text-charcoal/30 cursor-not-allowed'
              )}
            >
              {added ? 'Added' : 'Add to Bag'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
