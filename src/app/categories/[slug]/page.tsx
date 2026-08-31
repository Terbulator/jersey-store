'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { CATEGORIES, getProductsByCategory } from '@/lib/products';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug ?? '') as string;
  const category = CATEGORIES.find((c) => c.slug === slug);
  const products = getProductsByCategory(slug as 'retro' | 'current' | 'world-cup');

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/products">
            <ArrowLeft className="mr-1 h-4 w-4" /> All jerseys
          </Link>
        </Button>

        {!category ? (
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold">Category not found</h1>
            <p className="mt-2 text-muted-foreground">That collection doesn&apos;t exist.</p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse all jerseys</Link>
            </Button>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight">{category.title}</h1>
              <p className="mt-2 text-muted-foreground">
                {category.description} · {products.length} products
              </p>
            </header>

            {products.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No jerseys in this collection yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
