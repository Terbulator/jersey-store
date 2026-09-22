import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE FULL COLLECTION"
        description="Football, Cricket, Streetwear. Player Version, Master Edition, Special Edition. Every piece inspected, never copied."
      />
    </ShopPageShell>
  );
}