// src/app/products/page.tsx — SEO/UX/Perf++ (generateMeta + noindex filtres + OG dynamique)
import type { Metadata } from 'next'
import Link from '@/components/LocalizedLink'
import { getProductsPage } from '@/lib/data'
import ProductGrid from '@/components/ProductGrid'
import type { Product } from '@/types/product'
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo'

export const revalidate = 900

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo'
type Query = { q?: string; sort?: string; min?: string; max?: string; page?: string; cat?: string }

const SORT_VALUES: SortKey[] = ['price_asc', 'price_desc', 'rating', 'new', 'promo']
const PAGE_SIZE = 24

function buildQS(params: Query) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'new') sp.set('sort', params.sort)
  if (params.min) sp.set('min', params.min)
  if (params.max) sp.set('max', params.max)
  if (params.cat) sp.set('cat', params.cat)
  if (params.page && Number(params.page) > 1) sp.set('page', String(params.page))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/* ---------------------- Metadata dynamique ---------------------- */
export async function generateMetadata(
  { searchParams }: { searchParams?: Query }
): Promise<Metadata> {
  const q = (searchParams?.q ?? '').trim()
  const sort = (searchParams?.sort ?? 'new') as SortKey
  const page = Math.max(1, Number(searchParams?.page ?? 1))
  const min = searchParams?.min
  const max = searchParams?.max
  const cat = (searchParams?.cat ?? '').trim()

  const baseTitle = 'Tous les produits'
  const bits: string[] = []
  if (q) bits.push(`“${q}”`)
  if (cat) bits.push(`cat ${cat}`)
  if (min) bits.push(`min ${min}€`)
  if (max) bits.push(`max ${max}€`)
  if (sort && sort !== 'new') bits.push(`tri ${sort}`)
  if (page > 1) bits.push(`page ${page}`)

  const title = bits.length ? `${baseTitle} | ${bits.join(' · ')}` : baseTitle
  const description = 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.'

  const qs = buildQS({ q, sort, min, max, cat, page: String(page) })
  const hasFilters = !!(q || cat || min || max || (sort && sort !== 'new') || page > 1)

  // Canonical propre + hreflang auto (pages filtrées = noindex + canonical vers /products)
  return generateMeta({
    title,
    description,
    url: hasFilters ? '/products' : `/products${qs}`,
    image: `/api/og${qs}`,
    noindex: hasFilters,
  })
}

/* ------------------------------ Page ----------------------------- */
export default async function ProductsPage({ searchParams }: { searchParams?: Query }) {
  const q = (searchParams?.q ?? '').trim()
  const rawSort = (searchParams?.sort ?? 'new') as SortKey
  const sort: SortKey = SORT_VALUES.includes(rawSort) ? rawSort : 'new'

  const minNum = Number(searchParams?.min)
  const maxNum = Number(searchParams?.max)
  const min = Number.isFinite(minNum) && minNum >= 0 ? minNum : undefined
  const max = Number.isFinite(maxNum) && maxNum >= 0 ? maxNum : undefined

  const page = Math.max(1, Number(searchParams?.page ?? 1))
  const cat = (searchParams?.cat ?? '').trim() || null

  const minGreaterThanMax = typeof min === 'number' && typeof max === 'number' && min > max

  const { items, pageCount, total, categoryCounts } = await getProductsPage({
    q,
    min: minGreaterThanMax ? undefined : min,
    max: minGreaterThanMax ? undefined : max,
    sort,
    page,
    pageSize: PAGE_SIZE,
    category: cat,
  })

  const hasPrev = page > 1
  const hasNext = page < pageCount
  const buildUrl = (nextPage: number) =>
    `/products${buildQS({
      q,
      sort,
      min: minGreaterThanMax ? undefined : min?.toString(),
      max: minGreaterThanMax ? undefined : max?.toString(),
      cat: cat || undefined,
      page: String(nextPage),
    })}`

  const categories = Object.keys(categoryCounts || {}).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  )

  // JSON-LD
  const breadcrumbLd = jsonLdBreadcrumbs([
    { name: 'Accueil', url: '/' },
    { name: 'Produits', url: '/products' },
  ])

  const itemListLd =
    Array.isArray(items) && items.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: items.slice(0, PAGE_SIZE).map((p: any, i: number) => ({
            '@type': 'ListItem',
            position: (page - 1) * PAGE_SIZE + (i + 1),
            url: `${SITE}/products/${p?.slug ?? ''}`,
            name: p?.title ?? 'Produit',
          })),
        }
      : null

  // Filtres actifs (chips)
  const activeChips: Array<{ label: string; href: string }> = []
  if (q) activeChips.push({ label: `Recherche : “${q}”`, href: `/products${buildQS({ sort, min: min?.toString(), max: max?.toString(), cat: cat || undefined, page: '1' })}` })
  if (cat) activeChips.push({ label: `Catégorie : ${cat}`, href: `/products${buildQS({ q, sort, min: min?.toString(), max: max?.toString(), page: '1' })}` })
  if (typeof min === 'number') activeChips.push({ label: `Min ${min}€`, href: `/products${buildQS({ q, sort, max: max?.toString(), cat: cat || undefined, page: '1' })}` })
  if (typeof max === 'number') activeChips.push({ label: `Max ${max}€`, href: `/products${buildQS({ q, sort, min: min?.toString(), cat: cat || undefined, page: '1' })}` })
  if (sort !== 'new') activeChips.push({ label: `Tri : ${sort}`, href: `/products${buildQS({ q, min: min?.toString(), max: max?.toString(), cat: cat || undefined, page: '1' })}` })

  return (
    <main id="main" className="max-w-7xl mx-auto px-4 pt-28 pb-16" role="main" aria-describedby="result-count">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand dark:text-brand-light">
          Tous les produits
        </h1>
        <p id="result-count" className="mt-2 text-muted-foreground" aria-live="polite">
          {total} résultat{total > 1 ? 's' : ''}. Filtrez, triez et trouvez rapidement ce qu’il vous faut.
        </p>
        {minGreaterThanMax && (
          <p role="alert" className="mt-2 text-sm text-amber-600">
            Astuce&nbsp;: le prix minimum est supérieur au prix maximum. Les bornes ont été ignorées.
          </p>
        )}
      </header>

      {/* Barre de filtres SSR */}
      <form method="GET" className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" aria-label="Filtres catalogue">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un produit…"
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Rechercher un produit"
          enterKeyHint="search"
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

        <select
          name="cat"
          defaultValue={cat ?? ''}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c} ({categoryCounts[c]})
            </option>
          ))}
        </select>

        <input
          type="number"
          name="min"
          inputMode="numeric"
          defaultValue={typeof min === 'number' ? String(min) : ''}
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
            defaultValue={typeof max === 'number' ? String(max) : ''}
            placeholder="Prix max (€)"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Prix maximum"
            min={0}
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            aria-label="Appliquer les filtres"
          >
            Filtrer
          </button>
        </div>

        {(q || sort !== 'new' || typeof min === 'number' || typeof max === 'number' || cat || page > 1) && (
          <div className="lg:col-span-5 flex flex-wrap items-center gap-2 pt-1">
            {activeChips.map((chip, i) => (
              <Link
                key={chip.label + i}
                href={chip.href}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                aria-label={`Retirer le filtre ${chip.label}`}
              >
                <span>{chip.label}</span>
                <span aria-hidden>✕</span>
              </Link>
            ))}

            <Link
              href="/products"
              className="ml-auto inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-accent underline underline-offset-2"
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </form>

      <ProductGrid products={items as Product[]} emptyMessage="Aucun produit ne correspond à vos filtres." />

      <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3 text-sm">
        {hasPrev ? (
          <Link className="rounded-md border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800" href={buildUrl(page - 1)} prefetch={false}>
            ← Précédent
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-1.5 opacity-40">← Précédent</span>
        )}
        <span className="px-2">
          Page <strong>{page}</strong> / {Math.max(1, pageCount)}
        </span>
        {hasNext ? (
          <Link className="rounded-md border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800" href={buildUrl(page + 1)} prefetch={false}>
            Suivant →
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-1.5 opacity-40">Suivant →</span>
        )}
      </nav>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {itemListLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      ) : null}
    </main>
  )
}
