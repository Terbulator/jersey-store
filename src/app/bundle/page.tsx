import { BundlePageClient } from '@/components/website/bundle/bundle-page';
import { getProducts, getEditions } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function BundlePage() {
  const [products, editions] = await Promise.all([getProducts(), getEditions()]);

  return <BundlePageClient products={products} editions={editions} />;
}