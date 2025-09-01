// src/app/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts } from '@/lib/blog'
import BlogCard from '@/components/blog/BlogCard'
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo'

export const revalidate = 60

type SR = Record<string, string | string[] | undefined>

// 🔒 SITE normalisé (https + pas de trailing slash) pour JSON-LD absolu fiable
const RAW_SITE = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()
const SITE = (
  RAW_SITE
    ? (/^https?:\/\//i.test(RAW_SITE) ? RAW_SITE : `https://${RAW_SITE}`)
    : 'https://techplay.example.com'
).replace(/\/+$/, '')

/* ---------------------- Metadata dynamique ---------------------- */
export async function generateMetadata(
  { searchParams }: { searchParams?: SR }
): Promise<Metadata> {
  const q: string = typeof searchParams?.q === 'string' ? searchParams.q : ''
  const page = Math.max(1, Number(searchParams?.page || 1))

  const baseTitle = 'Blog TechPlay – Conseils et nouveautés'
  const title = q
    ? `Résultats pour “${q}” – Page ${page}`
    : page > 1
    ? `Blog TechPlay – Page ${page}`
    : baseTitle

  const description = q
    ? `Articles correspondant à “${q}” sur le blog TechPlay.`
    : 'Explorez nos articles, guides et conseils sur les produits TechPlay.'

  const sp = new URLSearchParams()
  if (q) sp.set('q', q)
  if (page > 1) sp.set('page', String(page))

  const path = `/blog${sp.toString() ? `?${sp}` : ''}`

  // hreflang/canonical/OG absolus + noindex pour les pages de recherche
  return generateMeta({
    title,
    description,
    url: path,
    image: '/og-image.jpg',
    noindex: !!q,
  })
}

/* ------------------------------ Page ----------------------------- */
export default async function BlogPage({ searchParams }: { searchParams?: SR }) {
  const page = Math.max(1, Number(searchParams?.page || 1))
  const limit = Math.max(1, Math.min(24, Number(searchParams?.limit || 12)))

  // Toujours des strings (jamais undefined) pour l’UI
  const q: string = typeof searchParams?.q === 'string' ? searchParams.q.trim() : ''
  const tagStr: string = typeof searchParams?.tag === 'string' ? searchParams.tag : ''
  const categoryStr: string =
    typeof searchParams?.category === 'string' ? searchParams.category : ''
  const sort: string =
    typeof searchParams?.sort === 'string' ? searchParams.sort : 'newest'

  // ✅ Construire l’objet params sans passer "undefined"
  const params: any = {
    page,
    limit,
    q,
    sort,
    publishedOnly: true,
  }
  if (tagStr) params.tag = tagStr as string
  if (categoryStr) params.category = categoryStr as string

  const { items: posts, pagination } = await getPosts(params)

  // Conserver les filtres dans les liens
  const persist = (
    next: Partial<Record<'page' | 'limit' | 'q' | 'tag' | 'category' | 'sort', string | number>>
  ) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (tagStr) sp.set('tag', tagStr)
    if (categoryStr) sp.set('category', categoryStr)
    if (sort) sp.set('sort', sort)
    sp.set('limit', String(limit))
    sp.set('page', String(next.page ?? page))
    return `/blog?${sp.toString()}`
  }

  // JSON-LD Breadcrumbs (Accueil > Blog)
  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: '/' },
    { name: 'Blog', url: '/blog' },
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 pt-32 pb-20" aria-labelledby="blog-title">
      <h1
        id="blog-title"
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light text-center mb-8"
      >
        {q ? `Résultats pour “${q}”` : 'Nos articles de blog'}
      </h1>

      {/* Recherche / tri */}
      <form role="search" className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3" action="/blog" method="GET">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un article…"
          className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Rechercher dans le blog"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Trier"
        >
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="popular">Populaires</option>
          <option value="az">Titre A→Z</option>
          <option value="za">Titre Z→A</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          >
            Filtrer
          </button>
          {(q || tagStr || categoryStr) && (
            <Link href="/blog" className="text-sm text-gray-600 hover:underline dark:text-gray-400" prefetch={false}>
              Réinitialiser
            </Link>
          )}
        </div>

        {/* Hidden: toujours des strings */}
        <input type="hidden" name="limit" value={String(limit)} />
        <input type="hidden" name="tag" value={tagStr || ''} />
        <input type="hidden" name="category" value={categoryStr || ''} />
      </form>

      {/* Liste */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg" role="status" aria-live="polite">
          Aucun article {q ? `pour “${q}”` : 'disponible'}.
        </p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Liste des articles">
          {posts.map((post: any, idx: number) => (
            <BlogCard key={(post._id as string) ?? (post.slug as string) ?? `post-${idx}`} article={post} />
          ))}
        </section>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination des articles">
          <Link
            href={persist({ page: Math.max(1, page - 1) })}
            prefetch={false}
            aria-disabled={page <= 1}
            className={`px-3 py-2 rounded-md border text-sm ${
              page <= 1
                ? 'pointer-events-none opacity-40 border-gray-300 dark:border-zinc-700'
                : 'border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
            }`}
          >
            ← Précédent
          </Link>

          {Array.from({ length: pagination.pages }).map((_, i) => {
            const n = i + 1
            if (n === 1 || n === pagination.pages || Math.abs(n - page) <= 1) {
              return (
                <Link
                  key={n}
                  href={persist({ page: n })}
                  prefetch={false}
                  aria-current={n === page ? 'page' : undefined}
                  className={`px-3 py-2 rounded-md border text-sm ${
                    n === page
                      ? 'bg-accent text-white border-accent'
                      : 'border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {n}
                </Link>
              )
            }
            if (n === 2 && page > 3) return <span key="dots-left" className="px-2 text-gray-400">…</span>
            if (n === pagination.pages - 1 && page < pagination.pages - 2)
              return <span key="dots-right" className="px-2 text-gray-400">…</span>
            return null
          })}

          <Link
            href={persist({ page: Math.min(pagination.pages, page + 1) })}
            prefetch={false}
            aria-disabled={page >= pagination.pages}
            className={`px-3 py-2 rounded-md border text-sm ${
              page >= pagination.pages
                ? 'pointer-events-none opacity-40 border-gray-300 dark:border-zinc-700'
                : 'border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
            }`}
          >
            Suivant →
          </Link>
        </nav>
      )}

      {/* JSON-LD (Breadcrumbs + ItemList) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: posts.map((p: any, idx: number) => ({
                '@type': 'ListItem',
                position: idx + 1 + (page - 1) * limit,
                url: `${SITE}/blog/${String(p.slug || '')}`,
                name: String(p.title || ''),
              })),
            }),
          }}
        />
      )}
    </main>
  )
}
