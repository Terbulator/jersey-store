'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Heart, Share2, Star, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';

const JerseyViewer = dynamic(
  () => import('@/components/3d/jersey-viewer').then((m) => m.JerseyViewer),
  { ssr: false, loading: () => <div className="h-full w-full skeleton rounded-2xl" /> }
);

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const COLORS = [
  { name: 'Home', hex: '#dc2626' },
  { name: 'Away', hex: '#1e40af' },
  { name: 'Third', hex: '#16a34a' },
];

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || 'unknown';
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<'3d' | 'image'>('3d');
  const addItem = useCart((s) => s.addItem);

  // Mock product — in real app, fetch from Prisma by slug
  const product = {
    id: slug,
    slug,
    name: 'Barcelona 2014/15 Home — Messi #10',
    description:
      'Relive the treble-winning season. This Barcelona home jersey features the iconic Blaugrana stripes with embroidered club crest and Qatar Airways sponsor. Premium breathable fabric with moisture-wicking technology.',
    price: 449,
    comparePrice: 599,
    rating: 4.8,
    reviews: 124,
    team: 'Barcelona',
    season: '2014/15',
    player: '10',
    brand: 'Nike',
    images: [
      'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1000&q=80',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1000&q=80',
      'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1000&q=80',
    ],
    inStock: true,
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: `${product.id}-${selectedSize}-${selectedColor.name}`,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity,
      slug: product.slug,
    });
    toast.success('Added to cart', { description: `${product.name} (${selectedSize}, ${selectedColor.name})` });
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-foreground">Jerseys</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ----- VIEWER ----- */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/30 to-muted">
              {view === '3d' ? (
                <JerseyViewer color={selectedColor.hex} className="rounded-2xl" />
              ) : (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}

              <div className="absolute left-3 top-3 z-10 flex gap-2">
                <Badge variant="success">In Stock</Badge>
                <Badge variant="warning">Limited Edition</Badge>
              </div>

              <div className="absolute bottom-3 right-3 z-10 flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-background/80 backdrop-blur" onClick={() => toast.success('Link copied')}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-background/80 backdrop-blur" onClick={() => toast.success('Added to wishlist')}>
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* View toggle + thumbnails */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant={view === '3d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('3d')}
                >
                  3D View
                </Button>
                <Button
                  variant={view === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('image')}
                >
                  Photo
                </Button>
              </div>
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setView('image')}
                    className="relative h-12 w-12 overflow-hidden rounded-md border-2 border-transparent hover:border-primary"
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ----- INFO ----- */}
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
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {product.comparePrice && (
                <Badge variant="destructive">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Color selector */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Color: <span className="text-muted-foreground font-normal">{selectedColor.name}</span>
              </h3>
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

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Size</h3>
                <Button variant="link" size="sm" className="h-auto p-0">Size guide</Button>
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

            {/* Quantity + add to cart */}
            <div className="flex gap-3">
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleAddToCart} size="lg" variant="glow" className="flex-1">
                Add to Cart · {formatPrice(product.price * quantity)}
              </Button>
            </div>

            <Button size="lg" variant="outline" className="w-full">
              Buy Now
            </Button>

            {/* Trust signals */}
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

        {/* ----- TABS ----- */}
        <section className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
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
                  ['Player', `#${product.player}`],
                  ['Brand', product.brand],
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
      </main>

      <Footer />
    </>
  );
}
