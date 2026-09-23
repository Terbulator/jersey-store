import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';
import { getProducts, getCategories, getEditions } from '@/lib/storefront';
import { getDisplay } from '@/lib/display';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function StreetwearPage() {
  const [products, categories, editions, display] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
    getDisplay(createClient()),
  ]);

  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE EVERYDAY — STREETWEAR"
        description="Oversized tees, hoodies & sweatshirts. Heavyweight fabric, boxy cuts."
        defaultCategory="streetwear"
        products={products}
        categories={categories}
        editions={editions}
        collection={display.collection}
      />
    </ShopPageShell>
  );
}