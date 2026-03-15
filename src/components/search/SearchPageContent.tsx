'use client'

import { useTranslations } from 'next-intl'

import type { Product } from '@/types/product'

import Link from '@/components/LocalizedLink'
import ProductGrid from '@/components/ProductGrid'
import { LIST_NAMES } from '@/lib/analytics-events'

export interface SearchBlogItem {
  _id?: string
  id?: string
  slug?: string
  title?: string
}

interface SearchPageContentProps {
  query: string
  products: Product[]
  blogItems: SearchBlogItem[]
}

export default function SearchPageContent({
  query,
  products,
  blogItems,
}: SearchPageContentProps) {
  const t = useTranslations('search')
  const titleText = query ? t('title_with_query', { query }) : t('title')
  const exampleHref = '/search?q=clavier'

  return (
    <main
      className="container-app mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6"
      role="main"
      aria-labelledby="search-title"
    >
      <h1 id="search-title" className="heading-page mb-8">
        {titleText}
      </h1>

      {!query ? (
        <p className="text-token-text/70">
          {t('hint_no_query')}{' '}
          <Link
            href={exampleHref}
            className="text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {exampleHref}
          </Link>
        </p>
      ) : (
        <>
          <section
            className="mb-12"
            aria-labelledby="search-products-heading"
          >
            <h2
              id="search-products-heading"
              className="text-xl font-bold text-[hsl(var(--text))] mb-4"
            >
              {t('products_heading')} ({products.length})
            </h2>
            {products.length === 0 ? (
              <p className="text-token-text/60">{t('no_products')}</p>
            ) : (
              <ProductGrid
                products={products}
                listName={LIST_NAMES.SEARCH_RESULTS}
                emptyMessage=""
                showWishlistIcon
              />
            )}
          </section>

          <section aria-labelledby="search-blog-heading">
            <h2
              id="search-blog-heading"
              className="text-xl font-bold text-[hsl(var(--text))] mb-4"
            >
              {t('blog_heading')} ({blogItems.length})
            </h2>
            {blogItems.length === 0 ? (
              <p className="text-token-text/60">{t('no_blog_posts')}</p>
            ) : (
              <ul className="space-y-3" role="list">
                {blogItems.map((post) => (
                  <li key={String(post._id ?? post.id ?? post.slug)}>
                    <Link
                      href={`/blog/${post.slug ?? ''}`}
                      className="block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-[15px] font-medium text-[hsl(var(--text))] transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    >
                      {post.title ?? t('untitled')}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}
