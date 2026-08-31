import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { getAllProducts, CATEGORIES, Product } from '@/lib/products';
import { ProductsFilter } from './products-filter';

// Skip static generation
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getAllProducts();
  const teams = ['All', ...new Set(products.map((p) => p.team).filter(Boolean))];
  const categories = CATEGORIES.map((c) => c.slug);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <Suspense>
        <ProductsFilter products={products} teams={teams} categories={categories} />
      </Suspense>
      <Footer />
    </>
  );
}
