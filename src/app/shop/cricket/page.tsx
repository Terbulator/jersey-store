import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';
import { getProducts, getCategories, getEditions } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function CricketPage() {
  const [products, categories, editions] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
  ]);

  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE CULTURE — CRICKET"
        description="IPL & international kits built for the stands and the streets."
        defaultCategory="cricket"
        products={products}
        categories={categories}
        editions={editions}
      />
    </ShopPageShell>
  );
}