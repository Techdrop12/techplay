/* src/app/products/page.tsx — version SSR robuste, typée, JSON-safe */
import Link from 'next/link'

import type { Metadata } from 'next'

import { generateMeta } from '@/lib/seo'

type SortKey = 'new' | 'price_asc' | 'price_desc'

type Query = {
  q?: string
  sort?: SortKey
  page?: string | number
  min?: string | number
  max?: string | number
  cat?: string
}

type NormalizedQuery = {
  q: string
  sort: SortKey
  page: number
  min?: number
  max?: number
  cat: string | null
}

type ProductListItem = {
  slug?: string
  title?: string
  price?: number
}

type ProductApiResult = {
  items: ProductListItem[]
  total: number
}

/* -------------------------------- Helpers ------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPromiseLike<T>(value: unknown): value is Promise<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

function toPlain<T>(value: T): T {
  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return value
  }
}

function readString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function readNumber(value: unknown): number | undefined {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN

  return Number.isFinite(parsed) ? parsed : undefined
}

async function resolveSearchParams(
  searchParams?: Promise<Query> | Query
): Promise<Query | undefined> {
  if (isPromiseLike<Query>(searchParams)) return await searchParams
  return searchParams
}

function normalizeSearchParams(sp?: Query): NormalizedQuery {
  const q = readString(sp?.q).trim()

  const rawSort = readString(sp?.sort, 'new') as SortKey
  const sort: SortKey = ['new', 'price_asc', 'price_desc'].includes(rawSort)
    ? rawSort
    : 'new'

  const page = Math.max(1, readNumber(sp?.page) ?? 1)

  const minRaw = readNumber(sp?.min)
  const maxRaw = readNumber(sp?.max)

  const min = typeof minRaw === 'number' && minRaw >= 0 ? minRaw : undefined
  const max = typeof maxRaw === 'number' && maxRaw >= 0 ? maxRaw : undefined

  const cat = readString(sp?.cat).trim() || null

  return { q, sort, page, min, max, cat }
}

function normalizeProductList(items: unknown[]): ProductListItem[] {
  return items.map((item) => {
    const record = isRecord(item) ? item : {}

    return {
      slug: readString(record.slug).trim() || undefined,
      title: readString(record.title).trim() || undefined,
      price: readNumber(record.price),
    }
  })
}

/* ----------------------------- Server fetch ----------------------------- */

async function fetchProductsServer(query: NormalizedQuery): Promise<ProductApiResult> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'http://localhost:3000'

  const params = new URLSearchParams()

  if (query.q) params.set('q', query.q)
  params.set('sort', query.sort)
  params.set('page', String(query.page))
  if (typeof query.min === 'number') params.set('min', String(query.min))
  if (typeof query.max === 'number') params.set('max', String(query.max))
  if (query.cat) params.set('cat', query.cat)

  try {
    const res = await fetch(`${base}/api/products?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!res.ok) return { items: [], total: 0 }

    const data: unknown = await res.json().catch(() => null)

    if (Array.isArray(data)) {
      const items = normalizeProductList(toPlain(data))
      return { items, total: items.length }
    }

    if (isRecord(data)) {
      const rawItems = Array.isArray(data.items) ? data.items : []
      const items = normalizeProductList(toPlain(rawItems))
      const total = readNumber(data.total) ?? items.length
      return { items, total }
    }

    return { items: [], total: 0 }
  } catch {
    return { items: [], total: 0 }
  }
}

/* ------------------------------- Metadata ------------------------------- */

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Query> | Query
}): Promise<Metadata> {
  const sp = await resolveSearchParams(searchParams)
  const query = normalizeSearchParams(sp)

  const bits: string[] = []

  if (query.q) bits.push(`Recherche: "${query.q}"`)
  if (query.cat) bits.push(`Catégorie: ${query.cat}`)
  if (typeof query.min === 'number' || typeof query.max === 'number') {
    bits.push(
      `Prix${typeof query.min === 'number' ? ` ≥ ${query.min}` : ''}${
        typeof query.max === 'number' ? ` ≤ ${query.max}` : ''
      }`
    )
  }
  if (query.sort !== 'new') bits.push(`Tri: ${query.sort}`)

  const title = bits.length ? `Produits — ${bits.join(' · ')}` : 'Tous les produits'
  const description = 'Découvrez notre catalogue de produits high-tech.'

  return generateMeta({
    title,
    description,
    url: '/products',
    image: '/og-products.jpg',
  })
}

/* --------------------------------- Page --------------------------------- */

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Query> | Query
}) {
  const sp = await resolveSearchParams(searchParams)
  const query = normalizeSearchParams(sp)

  const { items, total } = await fetchProductsServer(query)

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Produits</h1>

      <p className="mb-2 text-sm opacity-70">{total} résultat(s)</p>

      {(query.q || query.cat || typeof query.min === 'number' || typeof query.max === 'number') && (
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {query.q ? <>Recherche : <strong>{query.q}</strong>. </> : null}
          {query.cat ? <>Catégorie : <strong>{query.cat}</strong>. </> : null}
          {typeof query.min === 'number' ? <>Min : <strong>{query.min} €</strong>. </> : null}
          {typeof query.max === 'number' ? <>Max : <strong>{query.max} €</strong>. </> : null}
        </p>
      )}

      {items.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product, idx) => (
            <li key={product.slug ?? `product-${idx}`} className="rounded-xl border p-4">
              <h2 className="font-medium">{product.title ?? 'Produit'}</h2>

              {typeof product.price === 'number' ? <p className="mt-1">{product.price} €</p> : null}

              {product.slug ? (
                <Link href={`/products/${product.slug}`} className="mt-2 inline-block underline">
                  Voir
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}