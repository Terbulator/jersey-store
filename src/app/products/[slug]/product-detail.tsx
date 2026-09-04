'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Heart, Share2, Star, Truck, Shield, RotateCcw, Plus, Minus, PackageX } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/lib/products';

const JerseyViewer = dynamic(
  () => import('@/components/3d/jersey-viewer').then((m) => m.JerseyViewer),
  { ssr: false, loading: () => <div className="h-full w-full skeleton rounded-2xl" /> }
);

interface Props {
  product: Product;
  related: Product[];
}

export function ProductDetail({ product, related }: Props) {
  const SIZES = [...new Set(product.variants.map((v) => v.size))] as string[];
  const COLORS = [...new Map(product.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }])).values()];

  const [selectedSize, setSelectedSize] = useState<string>(SIZES[0] ?? 'M');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(COLORS[0] ?? { name: 'Home', hex: '#dc2626' });
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<'3d' | 'image'>('3d');
  const addItem = useCart((s) => s.addItem);
  const toggleCart = useCart((s) => s.toggleCart);
  const wishlisted = useWishlist((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor.name
  );

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Selected size/color is not available');
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: product.image,
      price: product.basePrice,
      size: selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity,
      slug: product.slug,
    });
    toast.success('Added to cart', { description: `${product.name} (${selectedSize}, ${selectedColor.name})` });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toggleCart(true);
  };

  return (
    <main className="container py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">Jerseys</Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${product.category}`} className="hover:text-foreground">
          {product.categoryLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* VIEWER */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/30 to-muted">
            {view === '3d' ? (
              <JerseyViewer color={selectedColor.hex} className="rounded-2xl" />
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}

            <div className="absolute left-3 top-3 z-10 flex gap-2">
              {product.inStock ? (
                <Badge variant="success">In Stock</Badge>
              ) : (
                <Badge variant="destructive">Sold Out</Badge>
              )}
              <Badge variant="outline">{product.categoryLabel}</Badge>
            </div>

            <div className="absolute bottom-3 right-3 z-10 flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-full bg-background/80 backdrop-blur" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Link copied')).catch(() => toast.success('Link ready'))}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-background/80 backdrop-blur"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                }}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant={view === '3d' ? 'default' : 'outline'} size="sm" onClick={() => setView('3d')}>3D View</Button>
              <Button variant={view === 'image' ? 'default' : 'outline'} size="sm" onClick={() => setView('image')}>Photo</Button>
            </div>
            <div className="flex gap-2">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setView('image')}
                  className={cn(
                    'relative h-12 w-12 overflow-hidden rounded-md border-2 transition-all',
                    view === 'image' && i === 0 ? 'border-primary' : 'border-transparent hover:border-primary'
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {product.team && <span className="font-semibold text-foreground">{product.team}</span>}
              {product.season && <span>· {product.season}</span>}
              {product.brand && <span>· {product.brand}</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-muted')} />
                ))}
              </div>
              <span className="text-sm font-medium">4.8</span>
              <span className="text-sm text-muted-foreground">(128 reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatPrice(product.basePrice)}</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {product.comparePrice && (
              <Badge variant="destructive">
                {Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div>
            <h3 className="text-sm font-semibold mb-3">Color: <span className="text-muted-foreground font-normal">{selectedColor.name}</span></h3>
            <div className="flex gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'h-10 w-10 rounded-full border-2 transition-all',
                    selectedColor.name === color.name
                      ? 'border-foreground scale-110 ring-2 ring-primary ring-offset-2'
                      : 'border-border hover:scale-105'
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Size</h3>
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link href="/size-chart">Size guide</Link>
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'h-11 rounded-md border-2 text-sm font-semibold transition-all',
                    selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-foreground'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAddToCart} size="lg" variant="glow" className="flex-1" disabled={!product.inStock || !selectedVariant || selectedVariant.stock <= 0}>
              Add to Cart · {formatPrice(product.basePrice * quantity)}
            </Button>
          </div>

          <Button size="lg" variant="outline" className="w-full" disabled={!product.inStock || !selectedVariant || selectedVariant.stock <= 0} onClick={handleBuyNow}>
            Buy Now
          </Button>

          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { icon: Truck, label: 'Free Shipping', sub: '2–5 days' },
              { icon: Shield, label: 'Authentic', sub: 'Quality assured' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '7 days' },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-3 text-center">
                  <item.icon className="h-5 w-5 mx-auto text-primary" />
                  <p className="text-xs font-semibold mt-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <section className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews (128)</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-6 space-y-3 text-muted-foreground">
            <p>{product.description}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Premium breathable polyester fabric</li>
              <li>Embroidered club crest and sponsor</li>
              <li>Sublimated graphics — no peeling or fading</li>
              <li>Regular fit, machine washable</li>
            </ul>
          </TabsContent>
          <TabsContent value="specs" className="py-6">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Team', product.team],
                ['Season', product.season],
                ['Player', product.player ? `#${product.player}` : '—'],
                ['Brand', product.brand ?? '—'],
                ['Material', '100% Polyester'],
                ['Fit', 'Regular'],
                ['Care', 'Machine wash cold'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="reviews" className="py-6 text-muted-foreground">
            <p>Reviews coming soon…</p>
          </TabsContent>
        </Tabs>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id} href={`/products/${r.slug}`} className="group">
                <Card className="overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image src={r.image} alt={r.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <CardContent className="p-4">
                    <p className="line-clamp-1 text-sm font-semibold">{r.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{formatPrice(r.basePrice)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
