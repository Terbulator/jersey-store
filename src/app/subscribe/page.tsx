import { SubscribePageClient } from '@/components/website/subscribe/subscribe-page';
import { getProducts } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function SubscribePage() {
  const products = await getProducts();

  return <SubscribePageClient products={products} />;
}