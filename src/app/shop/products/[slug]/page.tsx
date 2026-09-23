import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getProductBySlug,
  getProducts,
  getCategories,
  getEditions,
} from '@/lib/storefront';
import { getDisplay } from '@/lib/display';
import { relatedProducts } from '@/lib/catalog';
import { ProductDetail } from '@/components/website/product/product-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('name, description, image, seo_title, seo_description, og_image')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle();
  if (!data) return {};
  return {
    title: data.seo_title || `${data.name} — HEADERR`,
    description: data.seo_description || data.description || undefined,
    openGraph: {
      title: data.seo_title || data.name,
      description: data.seo_description || data.description || undefined,
      images: [data.og_image || data.image].filter(Boolean),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, products, categories, editions, display] = await Promise.all([
    getProductBySlug(params.slug),
    getProducts(),
    getCategories(),
    getEditions(),
    getDisplay(createClient()),
  ]);

  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      categories={categories}
      editions={editions}
      related={relatedProducts(product, products, 8)}
      display={display.detail}
    />
  );
}