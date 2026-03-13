import { cookies, headers } from 'next/headers'

import type { BlogPost } from '@/types/blog'
import type { Metadata } from 'next'

import BlogCard from '@/components/blog/BlogCard'
import Link from '@/components/LocalizedLink'
import { getPosts } from '@/lib/blog'
import { BRAND } from '@/lib/constants'
import { localizePath } from '@/lib/i18n-routing'
import { LOCALE_COOKIE, isLocale, pickBestLocale, type Locale } from '@/lib/language'
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo'

export const revalidate = 60

type SearchParams = Record<string, string | string[] | undefined>
type BlogPostLike = Record<string, unknown> & {
  _id?: string
  slug?: string
  title?: string
}

const SITE = BRAND.URL

function readQueryValue(params: SearchParams | undefined, key: string): string {
  const value = params?.[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  return ''
}

function readPositiveInt(params: SearchParams | undefined, key: string, fallback: number, max?: number): number {
  const raw = Number(readQueryValue(params, key))
  const value = Number.isFinite(raw) ? Math.max(1, raw) : fallback
  return typeof max === 'number' ? Math.min(value, max) : value
}

function toPostRecord(value: unknown): BlogPostLike {
  return value && typeof value === 'object' ? (value as BlogPostLike) : {}
}

function readPostString(post: unknown, key: 'slug' | 'title' | '_id'): string {
  const value = toPostRecord(post)[key]
  return typeof value === 'string' ? value : ''
}

type PageProps = {
  searchParams?: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : undefined
  const q = readQueryValue(resolved, 'q').trim()
  const page = readPositiveInt(resolved, 'page', 1)

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

  return generateMeta({
    title,
    description,
    url: `/blog${sp.toString() ? `?${sp.toString()}` : ''}`,
    image: '/og-image.jpg',
    noindex: Boolean(q),
  })
}

export default async function BlogPage({ searchParams }: PageProps) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const acceptLang = (await headers()).get('accept-language') || ''
  const locale: Locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : pickBestLocale(acceptLang)

  const resolved = searchParams ? await searchParams : undefined
  const page = readPositiveInt(resolved, 'page', 1)
  const limit = readPositiveInt(resolved, 'limit', 12, 24)

  const q = readQueryValue(resolved, 'q').trim()
  const tag = readQueryValue(resolved, 'tag').trim()
  const category = readQueryValue(resolved, 'category').trim()
  const sort = readQueryValue(resolved, 'sort').trim() || 'newest'

  const requestParams = {
    page,
    limit,
    q,
    sort,
    publishedOnly: true,
    tag,
    category,
  }

  const { items, pagination } = await getPosts(requestParams)
  const posts = Array.isArray(items) ? items : []

  const persist = (nextPage: number) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (tag) sp.set('tag', tag)
    if (category) sp.set('category', category)
    if (sort) sp.set('sort', sort)
    sp.set('limit', String(limit))
    sp.set('page', String(nextPage))
    return `/blog?${sp.toString()}`
  }

  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: localizePath('/', locale) },
    { name: 'Blog', url: localizePath('/blog', locale) },
  ])

  return (
    <main className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8" aria-labelledby="blog-title">
      <h1
        id="blog-title"
        className="mb-6 text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:mb-8 sm:text-4xl lg:text-5xl"
      >
        {q ? `Résultats pour “${q}”` : 'Nos articles'}
      </h1>

      <form
        role="search"
        className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
        action={localizePath('/blog', locale)}
        method="GET"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un article…"
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
          aria-label="Rechercher dans le blog"
        />

        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
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
            className="w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[13px] font-semibold text-slate-950 shadow-[0_8px_24px_rgba(20,184,166,0.35)] transition hover:shadow-[0_12px_32px_rgba(20,184,166,0.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] sm:w-auto"
          >
            Filtrer
          </button>

          {(q || tag || category) && (
            <Link href="/blog" className="text-sm text-gray-600 hover:underline dark:text-gray-400" prefetch={false}>
              Réinitialiser
            </Link>
          )}
        </div>

        <input type="hidden" name="limit" value={String(limit)} />
        <input type="hidden" name="tag" value={tag} />
        <input type="hidden" name="category" value={category} />
      </form>

      {posts.length === 0 ? (
        <p className="rounded-[1.25rem] border border-white/10 bg-[hsl(var(--surface))]/50 py-12 text-center text-[15px] text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
          Aucun article {q ? `pour “${q}”` : 'disponible'}.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" aria-label="Liste des articles">
          {posts.map((post, idx) => {
            const postId = readPostString(post, '_id')
            const postSlug = readPostString(post, 'slug')
            return <BlogCard key={postId || postSlug || `post-${idx}`} article={post as BlogPost} />
          })}
        </section>
      )}

      {pagination.pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination des articles">
          <Link
            href={persist(Math.max(1, page - 1))}
            prefetch={false}
            aria-disabled={page <= 1}
            className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
              page <= 1
                ? 'pointer-events-none border-[hsl(var(--border))] opacity-40'
                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]/80'
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
                  href={persist(n)}
                  prefetch={false}
                  aria-current={n === page ? 'page' : undefined}
                  className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
                    n === page
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-slate-950 shadow-[0_8px_24px_rgba(20,184,166,0.35)]'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]/80'
                  }`}
                >
                  {n}
                </Link>
              )
            }

            if (n === 2 && page > 3) return <span key="dots-left" className="px-2 text-gray-400">…</span>
            if (n === pagination.pages - 1 && page < pagination.pages - 2) {
              return <span key="dots-right" className="px-2 text-gray-400">…</span>
            }

            return null
          })}

          <Link
            href={persist(Math.min(pagination.pages, page + 1))}
            prefetch={false}
            aria-disabled={page >= pagination.pages}
            className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
              page >= pagination.pages
                ? 'pointer-events-none border-[hsl(var(--border))] opacity-40'
                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]/80'
            }`}
          >
            Suivant →
          </Link>
        </nav>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: posts.map((post, idx) => {
                const slug = readPostString(post, 'slug')
                const name = readPostString(post, 'title')
                return {
                  '@type': 'ListItem',
                  position: idx + 1 + (page - 1) * limit,
                  url: `${SITE}${localizePath(`/blog/${slug}`, locale)}`,
                  name,
                }
              }),
            }),
          }}
        />
      )}
    </main>
  )
}