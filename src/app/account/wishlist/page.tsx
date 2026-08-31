'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useWishlist } from '@/store/wishlist';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface WishlistProduct {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  image: string;
}

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const remove = useWishlist((s) => s.remove);
  const addItem = useCart((s) => s.addItem);
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/account">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to account
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Wishlist</h1>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><div className="h-64 skeleton" /></Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Your wishlist is empty</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Tap the heart on any jersey to save it here for later.
              </p>
              <Button asChild className="mt-6" variant="glow">
                <Link href="/products">Discover jerseys</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                    onClick={() => {
                      remove(product.id);
                      toast.success('Removed from wishlist');
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-primary">{formatPrice(product.basePrice)}</span>
                    <Button
                      size="sm"
                      onClick={() => {
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
                        toast.success('Added to cart');
                      }}
                    >
                      Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
