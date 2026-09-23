import { SearchPageClient } from '@/components/website/search/search-page';
import { getProducts, getEditions } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const [products, editions] = await Promise.all([getProducts(), getEditions()]);

  return <SearchPageClient products={products} editions={editions} />;
}