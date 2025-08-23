import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts } from '@/lib/data'
import type { Product } from '@/types/product'
import ProductGrid from '@/components/ProductGrid'

export const revalidate = 900 // 15 min (bon compromis SEO/fraîcheur)

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Tous les produits – TechPlay',
  description: 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.',
  alternates: { canonical: `${SITE}/products` },
  openGraph: {
    title: 'Tous les produits – TechPlay',
    description: 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.',
    type: 'website',
    url: `${SITE}/products`,
    images: [{ url: `${SITE}/og-products.jpg`, width: 1200, height: 630, alt: 'Catalogue TechPlay' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tous les produits – TechPlay',
    description: 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.',
  },
}

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo'
const SORT_VALUES: SortKey[] = ['price_asc', 'price_desc', 'rating', 'new', 'promo']

type Query = {
  q?: string
  sort?: string
  min?: string
  max?: string
  page?: string
}

const PAGE_SIZE = 24

export default async function ProductsPage({ searchParams }: { searchParams?: Query }) {
  const q = (searchParams?.q ?? '').trim().toLowerCase()

  const rawSort = searchParams?.sort ?? 'new'
  const sort: SortKey = SORT_VALUES.includes(rawSort as SortKey) ? (rawSort as SortKey) : 'new'

  const min = Number.isFinite(Number(searchParams?.min)) ? Number(searchParams!.min) : undefined
  const max = Number.isFinite(Number(searchParams?.max)) ? Number(searchParams!.max) : undefined
  const page = Math.max(1, Number(searchParams?.page ?? 1))

  const all = (await getAllProducts()) as Product[]
  let filtered = all.filter(Boolean)

  if (q) {
    filtered = filtered.filter((p) => {
      const hay = `${p.title ?? ''} ${(p as any).description ?? ''} ${
        Array.isArray((p as any).tags) ? (p as any).tags.join(' ') : ''
      }`.toLowerCase()
      return hay.includes(q)
    })
  }
  if (typeof min === 'number') filtered = filtered.filter((p) => (p.price ?? 0) >= min)
  if (typeof max === 'number') filtered = filtered.filter((p) => (p.price ?? 0) <= max)

  filtered.sort((a, b) => {
    const pa = a.price ?? 0
    const pb = b.price ?? 0
    const ra = (a as any).rating ?? 0
    const rb = (b as any).rating ?? 0
    const newA = (a as any).isNew ? 1 : 0
    const newB = (b as any).isNew ? 1 : 0
    const discA = a.oldPrice && a.oldPrice > pa ? Math.round(((a.oldPrice - pa) / a.oldPrice) * 100) : 0
    const discB = b.oldPrice && b.oldPrice > pb ? Math.round(((b.oldPrice - pb) / b.oldPrice) * 100) : 0

    switch (sort) {
      case 'price_asc':
        return pa - pb
      case 'price_desc':
        return pb - pa
      case 'rating':
        return rb - ra
      case 'promo':
        return discB - discA
      case 'new':
      default:
        return newB - newA
    }
  })

  const total = filtered.length
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pageItems = filtered.slice(start, end)
  const hasPrev = page > 1
  const hasNext = end < total

  const buildUrl = (nextPage: number) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (sort && sort !== 'new') sp.set('sort', sort)
    if (min !== undefined) sp.set('min', String(min))
    if (max !== undefined) sp.set('max', String(max))
    if (nextPage > 1) sp.set('page', String(nextPage))
    const qs = sp.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  return (
    <main id="main" className="max-w-7xl mx-auto px-4 pt-28 pb-16" role="main">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand dark:text-brand-light">
          Tous les produits
        </h1>
        <p className="mt-2 text-muted-foreground">
          Filtrez, triez et trouvez rapidement ce qu’il vous faut.
        </p>
      </header>

      <form method="GET" className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un produit…"
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Rechercher un produit"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Trier les produits"
        >
          <option value="new">Nouveautés</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="rating">Meilleures notes</option>
          <option value="promo">Meilleures promos</option>
        </select>
        <input
          type="number"
          name="min"
          inputMode="numeric"
          defaultValue={min ?? ''}
          placeholder="Prix min (€)"
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Prix minimum"
          min={0}
        />
        <div className="flex gap-2">
          <input
            type="number"
            name="max"
            inputMode="numeric"
            defaultValue={max ?? ''}
            placeholder="Prix max (€)"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Prix maximum"
            min={0}
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          >
            Filtrer
          </button>
        </div>

        {(q || sort !== 'new' || min !== undefined || max !== undefined || page > 1) && (
          <div className="lg:col-span-4">
            <Link
              href="/products"
              className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-accent"
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </form>

      <ProductGrid products={pageItems} emptyMessage="Aucun produit ne correspond à vos filtres." />

      <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3 text-sm">
        {hasPrev ? (
          <Link className="rounded-md border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800" href={buildUrl(page - 1)}>
            ← Précédent
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-1.5 opacity-40">← Précédent</span>
        )}
        <span className="px-2">
          Page <strong>{page}</strong> / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </span>
        {hasNext ? (
          <Link className="rounded-md border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800" href={buildUrl(page + 1)}>
            Suivant →
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-1.5 opacity-40">Suivant →</span>
        )}
      </nav>
    </main>
  )
}
