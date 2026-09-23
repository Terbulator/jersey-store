import { notFound } from 'next/navigation';
import {
  getProductBySlug,
  getProducts,
  getCategories,
  getEditions,
} from '@/lib/storefront';
import { relatedProducts } from '@/lib/catalog';
import { ProductDetail } from '@/components/website/product/product-detail';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, products, categories, editions] = await Promise.all([
    getProductBySlug(params.slug),
    getProducts(),
    getCategories(),
    getEditions(),
  ]);

  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      categories={categories}
      editions={editions}
      related={relatedProducts(product, products, 4)}
    />
  );
}