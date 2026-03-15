import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import SearchPageContent from '@/components/search/SearchPageContent'
import type { Product } from '@/types/product'
import { getPosts } from '@/lib/blog'
import { getProductsPage } from '@/lib/data'
import { isLocale, type Locale } from '@/lib/language'
import { generateMeta } from '@/lib/seo'

export const revalidate = 60

const PRODUCT_PAGE_SIZE = 12
const BLOG_LIMIT = 5

function searchPathForLocale(locale: Locale): string {
  return locale !== 'fr' ? `/${locale}/search` : '/search'
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'fr'
  const t = await getTranslations('seo')
  return generateMeta({
    title: t('search_title'),
    description: t('search_description'),
    url: searchPathForLocale(loc),
    noindex: true,
  })
}

export default async function LocaleSearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q } = await searchParams
  setRequestLocale(locale)
  const query = (q ?? '').trim()

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
  ])

  const products = productsResult?.items ?? []
  const blogItems = (blogResult?.items ?? []).map((item) => ({
    _id: (item as { _id?: string })._id,
    id: (item as { id?: string }).id,
    slug: (item as { slug?: string }).slug,
    title: (item as { title?: string }).title,
  }))

  return (
    <SearchPageContent
      query={query}
      products={products as Product[]}
      blogItems={blogItems}
    />
  )
}
