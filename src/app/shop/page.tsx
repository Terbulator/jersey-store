import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';
import { getProducts, getCategories, getEditions } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, categories, editions] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
  ]);

  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE FULL COLLECTION"
        description="Football, Cricket, Streetwear. Player Version, Master Edition, Special Edition. Every piece inspected, never copied."
        products={products}
        categories={categories}
        editions={editions}
      />
    </ShopPageShell>
  );
}