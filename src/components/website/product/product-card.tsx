'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
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
        <div className="relative aspect-[3/4] overflow-hidden bg-white border border-charcoal/5">
          {/* Primary Image */}
          <img
            src={product.image}
            alt={product.imageAlt || product.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
              hovered && secondImage ? 'opacity-0' : 'opacity-100'
            )}
          />
          {/* Second Image */}
          {secondImage && (
            <img
              src={secondImage}
              alt={`${product.name} alternate view`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                hovered ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}
          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-blood-red text-off-white text-[10px] tracking-widest uppercase">
              {product.badge}
            </span>
          )}
          {/* Zoom hint on hover */}
          <div className={cn(
            'absolute inset-0 bg-black/0 transition-colors duration-300',
            hovered && !showQuickAdd && 'bg-black/5'
          )} />
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={cn(
          'absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-200',
          isWishlisted
            ? 'text-blood-red'
            : 'text-charcoal/40 opacity-0 group-hover:opacity-100 hover:text-blood-red'
        )}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
      </button>

      {/* Product Info */}
      <div className="mt-3">
        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-charcoal tracking-wide truncate group-hover:text-blood-red transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-chrome tracking-wider uppercase mt-0.5">
          {product.edition === 'player' ? 'Player Version' : product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
        </p>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-sm font-bold text-charcoal">{formatPrice(product.basePrice)}</span>
          {product.comparePrice && (
            <span className="text-xs text-chrome line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>

      {/* Quick Add */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-white border-t border-charcoal/10 transition-all duration-250 overflow-hidden',
        showQuickAdd ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100'
      )}>
        {!showQuickAdd ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickAdd(true);
            }}
            className="w-full py-3 text-[11px] tracking-widest uppercase text-charcoal hover:text-blood-red transition-colors"
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
                    'flex-1 py-1.5 text-[11px] tracking-wider border transition-colors',
                    selectedSize === size
                      ? 'border-blood-red bg-blood-red text-off-white'
                      : 'border-charcoal/20 text-charcoal hover:border-charcoal'
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
                'w-full py-2.5 text-[11px] tracking-widest uppercase transition-colors',
                added
                  ? 'bg-green-600 text-white'
                  : selectedSize
                  ? 'bg-blood-red text-off-white hover:bg-charcoal'
                  : 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
              )}
            >
              {added ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
