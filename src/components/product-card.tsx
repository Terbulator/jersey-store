'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/products';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      description: product.name,
    });
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: `${product.id}-default`,
      name: product.name,
      image: product.image,
      price: product.basePrice,
      size: 'M',
      color: 'Default',
      colorHex: '#000000',
      quantity: 1,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          {product.featured && (
            <Badge className="absolute left-3 top-3 z-10" variant="success">
              Featured
            </Badge>
          )}
          <Link href={`/products/${product.slug}`} aria-label={product.name}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>

          <Button
            size="icon"
            variant="ghost"
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          {product.comparePrice && product.comparePrice > product.basePrice && (
            <Badge variant="destructive" className="absolute bottom-3 left-3 z-10">
              {Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            {product.team && <span>{product.team}</span>}
            {product.season && <span>{product.season}</span>}
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          {product.player && <p className="text-xs text-muted-foreground">#{product.player}</p>}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary">
                {formatPrice(product.basePrice)}
              </span>
              {product.comparePrice && product.comparePrice > product.basePrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
