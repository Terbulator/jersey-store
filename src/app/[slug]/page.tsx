import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StaticBlocks } from '@/components/website/static-blocks';

export const dynamic = 'force-dynamic';

async function getPage(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_pages')
    .select('title, blocks, seo_title, seo_description')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) return {};
  return {
    title: page.seo_title || `${page.title} — HEADERR`,
    description: page.seo_description || undefined,
  };
}

// CMS content pages live at /<slug>. Static routes (shop, about, …) take
// precedence in the App Router, so a page can never shadow store flows;
// reserved slugs are additionally rejected at write time.
export default async function CmsPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <section className="bg-black pt-36 sm:pt-44 pb-20 sm:pb-28 px-6 sm:px-8">
      <article className="mx-auto max-w-[720px]">
        <h1 className="th-h1 mb-10 text-off-white">{page.title}</h1>
        <StaticBlocks blocks={(page.blocks as []) ?? []} />
      </article>
    </section>
  );
}
