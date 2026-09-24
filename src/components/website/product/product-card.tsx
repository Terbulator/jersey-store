'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { metaLine } from '@/lib/catalog';
import type { Edition, Product } from '@/lib/storefront-types';
import { cn } from '@/lib/utils';
import { useTemplates } from '@/components/website/theme-provider';

const RATIOS: Record<string, string> = {
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  '4/5': 'aspect-[4/5]',
};

export function ProductCard({
  product,
  editions,
  priority = false,
}: {
  product: Product;
  editions: Edition[];
  priority?: boolean;
}) {
  const T = useTemplates().card;
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [pulse, setPulse] = useState(0);

  const secondImage = product.images?.[1];

  return (
    <div className="group">
      <Link
        href={`/shop/products/${product.slug}`}
        style={T.radius ? { borderRadius: T.radius } : undefined}
        className={cn('block relative bg-off-white overflow-hidden', RATIOS[T.image_ratio] ?? 'aspect-[3/4]')}
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        {T.show_second_image && secondImage && (
          <Image
            src={secondImage}
            alt=""
            aria-hidden="true"
            fill
            className="absolute inset-0 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
        )}

        {product.badge && (
          <span
            className={cn(
              'absolute top-3 left-3 font-mono-meta text-[9px] px-2.5 py-1',
              T.badge_style === 'pill' && 'rounded-full',
              product.badge === 'NEW' && 'bg-red text-white',
              product.badge === 'SALE' && 'bg-black text-off-white',
              product.badge === 'LIMITED' && 'bg-off-white text-black border border-black/10'
            )}
          >
            {product.badge}
          </span>
        )}

        {T.show_wishlist && (
          <motion.button
          key={pulse}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
            setPulse((p) => p + 1);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          initial={false}
          animate={{ scale: pulse ? [1, 1.16, 1] : 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart
            className={cn('w-4 h-4 transition-colors', isWishlisted ? 'text-[#B3001B]' : 'text-black')}
            strokeWidth={1.5}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </motion.button>
        )}

        {T.show_quick_add && (
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
        )}
      </Link>

      <div className="pt-3.5 px-0.5">
        <p className="font-mono-meta text-[9px] text-chrome">{metaLine(product, editions)}</p>
        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="headline text-lg sm:text-xl text-navy mt-1.5 leading-tight">
            {product.name}
          </h3>
        </Link>
        {T.show_description && (
          <p className="text-[13px] text-chrome mt-1 leading-relaxed line-clamp-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[15px] text-navy font-medium">{formatPrice(product.basePrice)}</span>
          {T.show_compare && product.comparePrice && product.comparePrice > product.basePrice && (
            <span className="text-xs text-chrome line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}