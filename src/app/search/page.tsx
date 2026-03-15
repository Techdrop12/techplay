import type { Metadata } from 'next'

import Link from 'next/link'

import ProductGrid from '@/components/ProductGrid'
import { getPosts } from '@/lib/blog'
import { getProductsPage } from '@/lib/data'
import { LIST_NAMES } from '@/lib/analytics-events'

export const metadata: Metadata = {
  title: 'Recherche – TechPlay',
  description: 'Résultats de recherche produits et blog.',
  robots: { index: false, follow: true },
}

const PRODUCT_PAGE_SIZE = 12
const BLOG_LIMIT = 5

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
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
  const blogItems = blogResult?.items ?? []

  return (
    <main
      className="container-app mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6"
      role="main"
      aria-labelledby="search-title"
    >
      <h1 id="search-title" className="heading-page mb-8">
        Recherche
        {query ? ` : « ${query} »` : ''}
      </h1>

      {!query ? (
        <p className="text-token-text/70">
          Saisissez un mot-clé dans la barre de recherche (header) ou via l’URL :{' '}
          <Link href="/search?q=clavier" className="text-[hsl(var(--accent))] hover:underline">
            /search?q=clavier
          </Link>
        </p>
      ) : (
        <>
          <section
            className="mb-12"
            aria-labelledby="search-products-heading"
          >
            <h2 id="search-products-heading" className="text-xl font-bold text-[hsl(var(--text))] mb-4">
              Produits ({products.length})
            </h2>
            {products.length === 0 ? (
              <p className="text-token-text/60">Aucun produit trouvé.</p>
            ) : (
              <ProductGrid
                products={products}
                listName={LIST_NAMES.SEARCH_RESULTS}
                emptyMessage=""
                showWishlistIcon
              />
            )}
          </section>

          <section
            aria-labelledby="search-blog-heading"
          >
            <h2 id="search-blog-heading" className="text-xl font-bold text-[hsl(var(--text))] mb-4">
              Articles du blog ({blogItems.length})
            </h2>
            {blogItems.length === 0 ? (
              <p className="text-token-text/60">Aucun article trouvé.</p>
            ) : (
              <ul className="space-y-3" role="list">
                {(blogItems as { _id?: string; id?: string; slug?: string; title?: string }[]).map((post) => (
                  <li key={String(post._id ?? post.id ?? post.slug)}>
                    <Link
                      href={`/blog/${post.slug ?? ''}`}
                      className="block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-[15px] font-medium text-[hsl(var(--text))] transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    >
                      {post.title ?? 'Sans titre'}
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
