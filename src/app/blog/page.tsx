// src/app/blog/page.tsx
import { cookies, headers } from 'next/headers'

import type { Metadata } from 'next'

import BlogCard from '@/components/blog/BlogCard'
import Link from '@/components/LocalizedLink'
import { getPosts } from '@/lib/blog'
import { BRAND } from '@/lib/constants'
import { localizePath } from '@/lib/i18n-routing'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  pickBestLocale,
  type Locale,
} from '@/lib/language'
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo'

export const revalidate = 60

const SITE = BRAND.URL

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  params?: Promise<Record<string, string | string[] | undefined>>
  searchParams?: Promise<SearchParams>
}

type BlogListOpts = {
  page: number
  limit: number
  publishedOnly: boolean
  tag: string
  category: string
  q: string
  sort: string
}

type BlogListItem = {
  _id?: string
  id?: string
  slug?: string
  title?: string
  content?: string
  description?: string
  summary?: string
  excerpt?: string
  image?: string
  author?: string
  published?: boolean
  publishedAt?: string | Date
  createdAt?: string | Date
  updatedAt?: string | Date
  category?: string
  tags?: string[]
}

type BlogCardArticle = {
  _id: string
  id: string
  slug: string
  title: string
  content: string
  description: string
  summary: string
  excerpt: string
  image: string
  author: string
  published: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  category: string
  tags: string[]
}

type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
}

type GetPostsResult = {
  items: BlogListItem[]
  pagination: Pagination
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFirstString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim()
        if (trimmed) return trimmed
      }
    }
  }

  return undefined
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function getNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function getSearchParam(searchParams: SearchParams | undefined, key: string, fallback = ''): string {
  if (!searchParams) return fallback
  return getFirstString(searchParams[key]) ?? fallback
}

function toIsoString(value: unknown, fallback = new Date().toISOString()): string {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : fallback
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isFinite(d.getTime()) ? d.toISOString() : fallback
  }

  return fallback
}

function toBlogOptions(searchParams: SearchParams | undefined): BlogListOpts {
  return {
    page: Math.max(1, getNumber(getSearchParam(searchParams, 'page', '1'), 1)),
    limit: Math.max(1, Math.min(24, getNumber(getSearchParam(searchParams, 'limit', '12'), 12))),
    publishedOnly: true,
    tag: getSearchParam(searchParams, 'tag', ''),
    category: getSearchParam(searchParams, 'category', ''),
    q: getSearchParam(searchParams, 'q', '').trim(),
    sort: getSearchParam(searchParams, 'sort', 'newest'),
  }
}

function normalizeBlogItem(item: unknown, idx: number): BlogCardArticle {
  const record = isRecord(item) ? item : {}

  const slug = getString(record.slug, '')
  const title = getString(record.title, 'Article sans titre')
  const summary = getString(record.summary, '')
  const excerpt = getString(record.excerpt, summary)
  const description = getString(record.description, excerpt || summary)
  const content = getString(record.content, description || summary || title)
  const image = getString(record.image, '/og-image.jpg')
  const author = getString(record.author, 'TechPlay')
  const category = getString(record.category, '')
  const tags = Array.isArray(record.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === 'string')
    : []

  const rawId =
    getString(record._id, '') ||
    getString(record.id, '') ||
    (slug ? `post-${slug}` : `post-${idx}`)

  const createdAt = toIsoString(record.createdAt ?? record.publishedAt)
  const publishedAt = toIsoString(record.publishedAt ?? record.createdAt, createdAt)
  const updatedAt = toIsoString(record.updatedAt ?? record.createdAt, createdAt)

  return {
    _id: rawId,
    id: rawId,
    slug,
    title,
    content,
    description,
    summary,
    excerpt,
    image,
    author,
    published: record.published === true,
    publishedAt,
    createdAt,
    updatedAt,
    category,
    tags,
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = await searchParams
  const opts = toBlogOptions(resolved)
  const q = opts.q
  const page = opts.page

  const baseTitle = 'Blog TechPlay – Conseils et nouveautés'
  const title = q
    ? `Résultats pour “${q}” – Page ${page}`
    : page > 1
      ? `Blog TechPlay – Page ${page}`
      : baseTitle

  const description = q
    ? `Articles correspondant à « ${q} » sur le blog TechPlay.`
    : "Guide d'achat, tests et actualités high-tech. Conseils produits, bons plans et nouveautés pour bien choisir sur TechPlay."

  const sp = new URLSearchParams()
  if (q) sp.set('q', q)
  if (page > 1) sp.set('page', String(page))

  const path = `/blog${sp.toString() ? `?${sp.toString()}` : ''}`

  return generateMeta({
    title,
    description,
    url: path,
    image: '/og-image.jpg',
    noindex: Boolean(q),
  })
}

export default async function BlogPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value ?? ''
  const acceptLang = (await headers()).get('accept-language') || ''
  const pickedLocale = pickBestLocale(acceptLang)

  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : isLocale(pickedLocale)
      ? pickedLocale
      : DEFAULT_LOCALE

  const resolved = searchParams ? await searchParams : undefined
  const opts = toBlogOptions(resolved)

  const q = opts.q
  const tagStr = opts.tag
  const categoryStr = opts.category
  const sort = opts.sort
  const page = opts.page
  const limit = opts.limit

  const data = (await getPosts(opts)) as GetPostsResult

  const rawPosts = Array.isArray(data?.items) ? data.items : []
  const posts: BlogCardArticle[] = rawPosts.map((post, idx) => normalizeBlogItem(post, idx))

  const pagination: Pagination = {
    page: getNumber(data?.pagination?.page, page),
    limit: getNumber(data?.pagination?.limit, limit),
    total: getNumber(data?.pagination?.total, posts.length),
    pages: Math.max(1, getNumber(data?.pagination?.pages, 1)),
  }

  const persist = (
    next: Partial<Record<'page' | 'limit' | 'q' | 'tag' | 'category' | 'sort', string | number>>
  ) => {
    const sp = new URLSearchParams()

    if (q) sp.set('q', q)
    if (tagStr) sp.set('tag', tagStr)
    if (categoryStr) sp.set('category', categoryStr)
    if (sort) sp.set('sort', sort)

    sp.set('limit', String(next.limit ?? limit))
    sp.set('page', String(next.page ?? page))

    return `/blog?${sp.toString()}`
  }

  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: localizePath('/', locale) },
    { name: 'Blog', url: localizePath('/blog', locale) },
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 pt-32 pb-20" aria-labelledby="blog-title">
      <h1
        id="blog-title"
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light text-center mb-8"
      >
        {q ? `Résultats pour “${q}”` : 'Nos articles de blog'}
      </h1>

      <form
        role="search"
        className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3"
        action={localizePath('/blog', locale)}
        method="GET"
      >
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
            <Link
              href="/blog"
              className="text-sm text-gray-600 hover:underline dark:text-gray-400"
              prefetch={false}
            >
              Réinitialiser
            </Link>
          )}
        </div>

        <input type="hidden" name="limit" value={String(limit)} />
        <input type="hidden" name="tag" value={tagStr} />
        <input type="hidden" name="category" value={categoryStr} />
      </form>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg" role="status" aria-live="polite">
          Aucun article {q ? `pour “${q}”` : 'disponible'}.
        </p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Liste des articles">
          {posts.map((post, idx) => (
            <BlogCard
              key={post._id || post.slug || `post-${idx}`}
              article={post}
            />
          ))}
        </section>
      )}

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

            if (n === 2 && page > 3) {
              return <span key="dots-left" className="px-2 text-gray-400">…</span>
            }

            if (n === pagination.pages - 1 && page < pagination.pages - 2) {
              return <span key="dots-right" className="px-2 text-gray-400">…</span>
            }

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
              itemListElement: posts.map((post, idx) => ({
                '@type': 'ListItem',
                position: idx + 1 + (page - 1) * limit,
                url: `${SITE}${localizePath(`/blog/${post.slug}`, locale)}`,
                name: post.title,
              })),
            }),
          }}
        />
      )}
    </main>
  )
}