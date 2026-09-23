import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';
import { getProducts, getCategories, getEditions } from '@/lib/storefront';
import { getDisplay } from '@/lib/display';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, categories, editions, display] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
    getDisplay(createClient()),
  ]);

  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE FULL COLLECTION"
        description="Football, Cricket, Streetwear. Player Version, Master Edition, Special Edition. Every piece inspected, never copied."
        products={products}
        categories={categories}
        editions={editions}
        collection={display.collection}
      />
    </ShopPageShell>
  );
}