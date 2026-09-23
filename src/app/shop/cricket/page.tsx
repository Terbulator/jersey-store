import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';
import { getProducts, getCategories, getEditions } from '@/lib/storefront';
import { getDisplay } from '@/lib/display';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CricketPage() {
  const [products, categories, editions, display] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
    getDisplay(createClient()),
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
        collection={display.collection}
      />
    </ShopPageShell>
  );
}