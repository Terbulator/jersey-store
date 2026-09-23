import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';
import { getProducts, getCategories, getEditions } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function FootballPage() {
  const [products, categories, editions] = await Promise.all([
    getProducts(),
    getCategories(),
    getEditions(),
  ]);

  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE GAME — FOOTBALL"
        description="Club & national team jerseys. Player-version cuts that move like the pros."
        defaultCategory="football"
        products={products}
        categories={categories}
        editions={editions}
      />
    </ShopPageShell>
  );
}