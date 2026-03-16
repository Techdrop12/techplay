import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SearchPageContent from '@/components/search/SearchPageContent';
import type { Product } from '@/types/product';
import { getPosts } from '@/lib/blog';
import { getProductsPage } from '@/lib/data';
import { generateMeta } from '@/lib/seo';

const PRODUCT_PAGE_SIZE = 12;
const BLOG_LIMIT = 5;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo');
  return generateMeta({
    title: t('search_title'),
    description: t('search_description'),
    url: '/search',
    noindex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const [productsResult, blogResult] = await Promise.all([
    getProductsPage({
      q: query || undefined,
      page: 1,
      pageSize: PRODUCT_PAGE_SIZE,
      sort: 'new',
    }),
    getPosts({
      q: query || undefined,
      limit: BLOG_LIMIT,
      publishedOnly: true,
      sort: 'newest',
    }),
  ]);

  const products = productsResult?.items ?? [];
  const blogItems = (blogResult?.items ?? []).map((item) => ({
    _id: (item as { _id?: string })._id,
    id: (item as { id?: string }).id,
    slug: (item as { slug?: string }).slug,
    title: (item as { title?: string }).title,
  }));

  return <SearchPageContent query={query} products={products as Product[]} blogItems={blogItems} />;
}
