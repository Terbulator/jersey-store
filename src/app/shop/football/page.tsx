import { ShopPageShell, ShopTemplate } from '@/components/website/shop/shop-template';

export const dynamic = 'force-dynamic';

export default function FootballPage() {
  return (
    <ShopPageShell>
      <ShopTemplate
        title="THE GAME — FOOTBALL"
        description="Club & national team jerseys. Player-version cuts that move like the pros."
        defaultCategory="football"
      />
    </ShopPageShell>
  );
}