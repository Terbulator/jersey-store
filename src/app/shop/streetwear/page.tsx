import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';

export const dynamic = 'force-dynamic';

export default function StreetwearPage() {
  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE EVERYDAY — STREETWEAR"
        description="Oversized tees, hoodies & sweatshirts. Heavyweight fabric, boxy cuts."
        defaultCategory="streetwear"
      />
    </ShopPageShell>
  );
}