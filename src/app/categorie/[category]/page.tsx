import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts } from '@/lib/data'
import type { Product } from '@/types/product'
import ProductGrid from '@/components/ProductGrid'
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo'

export const revalidate = 900

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo'
const SORT_VALUES: SortKey[] = ['price_asc', 'price_desc', 'rating', 'new', 'promo']

interface Props {
  params: { category: string }
  searchParams?: { q?: string; sort?: string; min?: string; max?: string; page?: string }
}

// --- icônes inline pour l'entête
const Icon = {
  Headphones: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a7 7 0 0 1 14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z"/></svg>),
  Keyboard: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M3 6h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 3h2v2H5V9Zm3 0h2v2H8V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9ZM5 12h2v2H5v-2Zm3 0h2v2H8v-2Zm3 0h5v2h-5v-2Z"/></svg>),
  Mouse: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6Zm0 2a4 4 0 0 0-4 4v2h8V8a4 4 0 0 0-4-4Zm-.5 1h1v3h-1V5Z"/></svg>),
  Camera: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M9 4h6l1.5 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3L9 4Zm3 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/></svg>),
  Battery: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M2 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8Zm9 1-3 5h2v3l3-5h-2V9Z"/></svg>),
  Speaker: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm5 2a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 6Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>),
  Drive: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm3 1h10v3H7V8Zm0 5h6v4H7v-4Z"/></svg>),
  Monitor: (p: any) => (<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}><path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7v2h3v2H7v-2h3v-2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/></svg>),
}

const ICON_BY_SLUG: Record<string, (p: any) => JSX.Element> = {
  casques: Icon.Headphones,
  claviers: Icon.Keyboard,
  souris: Icon.Mouse,
  webcams: Icon.Camera,
  batteries: Icon.Battery,
  audio: Icon.Speaker,
  stockage: Icon.Drive,
  ecrans: Icon.Monitor,
}

// ✅ SEO dynamique (canonical/hreflang/OG absolus via generateMeta)
export function generateMetadata({ params, searchParams }: Props): Metadata {
  const capitalized =
    params.category.charAt(0).toUpperCase() +
    params.category.slice(1).replace(/-/g, ' ')

  // noindex si recherche/filtre — on évite d’indexer les SERP internes
  const hasFilters =
    !!searchParams?.q || !!searchParams?.min || !!searchParams?.max

  return generateMeta({
    title: `${capitalized} – Produits TechPlay`,
    description: `Explorez tous les produits de la catégorie « ${capitalized} » sur TechPlay.`,
    url: `/categorie/${params.category}`, // relatif : helper gère l’absolu + hreflang
    image: '/og-image.jpg',
    noindex: hasFilters,
  })
}

const PAGE_SIZE = 24

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = params
  const displayCategory =
    category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
  const CatIcon = ICON_BY_SLUG[category]

  const q = (searchParams?.q ?? '').trim().toLowerCase()

  const rawSort = searchParams?.sort ?? 'new'
  const sort: SortKey = SORT_VALUES.includes(rawSort as SortKey)
    ? (rawSort as SortKey)
    : 'new'

  const min = Number.isFinite(Number(searchParams?.min)) ? Number(searchParams!.min) : undefined
  const max = Number.isFinite(Number(searchParams?.max)) ? Number(searchParams!.max) : undefined
  const page = Math.max(1, Number(searchParams?.page ?? 1))

  const all = (await getAllProducts()) as Product[]
  let filtered = all.filter((p) => (p as any).category === category)

  if (q) {
    filtered = filtered.filter((p) => {
      const hay =
        `${p.title ?? ''} ${(p as any).description ?? ''} ${Array.isArray((p as any).tags) ? (p as any).tags.join(' ') : ''}`.toLowerCase()
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
    const discA =
      a.oldPrice && a.oldPrice > pa ? Math.round(((a.oldPrice - pa) / a.oldPrice) * 100) : 0
    const discB =
      b.oldPrice && b.oldPrice > pb ? Math.round(((b.oldPrice - pb) / b.oldPrice) * 100) : 0

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
    return qs ? `/categorie/${category}?${qs}` : `/categorie/${category}`
  }

  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: '/' },
    { name: 'Catégories', url: '/categorie' },
    { name: displayCategory, url: `/categorie/${category}` },
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 pt-28 pb-20" aria-labelledby="category-title" id="main">
      <div className="text-center mb-10">
        <h1
          id="category-title"
          className="inline-flex items-center gap-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light"
        >
          {CatIcon && <CatIcon className="opacity-90" />}
          {displayCategory}
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez notre sélection dans la catégorie « {displayCategory} ».
        </p>
      </div>

      <form method="GET" className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher dans cette catégorie…"
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Rechercher"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Trier"
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
              href={`/categorie/${category}`}
              className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-accent"
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </form>

      <ProductGrid
        products={pageItems}
        emptyMessage={`Aucun produit trouvé dans la catégorie "${displayCategory}".`}
      />

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

      {/* JSON-LD Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
    </main>
  )
}
