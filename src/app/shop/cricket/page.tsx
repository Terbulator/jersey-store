import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';

export const dynamic = 'force-dynamic';

export default function CricketPage() {
  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE CULTURE — CRICKET"
        description="IPL & international kits built for the stands and the streets."
        defaultCategory="cricket"
      />
    </ShopPageShell>
  );
}