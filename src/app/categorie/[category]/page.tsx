import type { Product } from '@/types/product'
import type { Metadata } from 'next'
import type { SVGProps, JSX } from 'react';


import Link from '@/components/LocalizedLink'
import ProductGrid from '@/components/ProductGrid'
import { LIST_NAMES } from '@/lib/analytics-events'
import { getAllProducts } from '@/lib/data'
import { generateMeta, jsonLdBreadcrumbs, jsonLdItemList } from '@/lib/seo'

export const revalidate = 900

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo'
type ProductRecord = Record<string, unknown>
type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element

const SORT_VALUES: SortKey[] = ['price_asc', 'price_desc', 'rating', 'new', 'promo']
const PAGE_SIZE = 24

interface Props {
  params: Promise<{ category: string }>
  searchParams?: Promise<{ q?: string; sort?: string; min?: string; max?: string; page?: string }>
}

function isRecord(value: unknown): value is ProductRecord {
  return typeof value === 'object' && value !== null
}

function toRecord(value: unknown): ProductRecord {
  return isRecord(value) ? value : {}
}

function readString(record: ProductRecord, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function readStringArray(record: ProductRecord, key: string): string[] {
  const value = record[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function readNumber(record: ProductRecord, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key]
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function readBoolean(record: ProductRecord, keys: readonly string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
  }
  return undefined
}

const Icon = {
  Headphones: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a7 7 0 0 1 14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z" />
    </svg>
  ),
  Keyboard: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 6h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 3h2v2H5V9Zm3 0h2v2H8V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9ZM5 12h2v2H5v-2Zm3 0h2v2H8v-2Zm3 0h5v2h-5v-2Z" />
    </svg>
  ),
  Mouse: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6Zm0 2a4 4 0 0 0-4 4v2h8V8a4 4 0 0 0-4-4Zm-.5 1h1v3h-1V5Z" />
    </svg>
  ),
  Camera: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 4h6l1.5 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3L9 4Zm3 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
  ),
  Battery: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M2 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8Zm9 1-3 5h2v3l3-5h-2V9Z" />
    </svg>
  ),
  Speaker: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm5 2a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 6Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  ),
  Drive: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm3 1h10v3H7V8Zm0 5h6v4H7v-4Z" />
    </svg>
  ),
  Monitor: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7v2h3v2H7v-2h3v-2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  ),
}

const ICON_BY_SLUG: Record<string, IconComponent> = {
  casques: Icon.Headphones,
  claviers: Icon.Keyboard,
  souris: Icon.Mouse,
  webcams: Icon.Camera,
  batteries: Icon.Battery,
  audio: Icon.Speaker,
  stockage: Icon.Drive,
  ecrans: Icon.Monitor,
}

function getProductCategory(product: Product): string {
  return readString(toRecord(product), ['category']) ?? ''
}

function getProductSearchText(product: Product): string {
  const record = toRecord(product)
  const tags = readStringArray(record, 'tags').join(' ')
  return `${product.title ?? ''} ${readString(record, ['description']) ?? ''} ${tags}`.toLowerCase()
}

function getProductRating(product: Product): number {
  return readNumber(toRecord(product), ['rating']) ?? 0
}

function isNewProduct(product: Product): boolean {
  return readBoolean(toRecord(product), ['isNew']) ?? false
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params
  const sp = await searchParams
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
  const hasFilters = Boolean(sp?.q || sp?.min || sp?.max)

  return generateMeta({
    title: `${capitalized} – Produits TechPlay`,
    description: `Achetez ${capitalized} sur TechPlay. Sélection de produits high-tech, livraison rapide et SAV. Comparez les prix et les avis.`,
    url: `/categorie/${category}`,
    image: '/og-image.jpg',
    noindex: hasFilters,
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const sp = searchParams ? await searchParams : undefined
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
  const CatIcon = ICON_BY_SLUG[category]

  const q = (sp?.q ?? '').trim().toLowerCase()

  const rawSort = sp?.sort ?? 'new'
  const sort: SortKey = SORT_VALUES.includes(rawSort as SortKey) ? (rawSort as SortKey) : 'new'

  const min = Number.isFinite(Number(sp?.min)) ? Number(sp?.min) : undefined
  const max = Number.isFinite(Number(sp?.max)) ? Number(sp?.max) : undefined
  const page = Math.max(1, Number(sp?.page ?? 1))

  const all = (await getAllProducts()) as Product[]
  let filtered = all.filter((product) => getProductCategory(product) === category)

  if (q) {
    filtered = filtered.filter((product) => getProductSearchText(product).includes(q))
  }

  if (typeof min === 'number') filtered = filtered.filter((product) => (product.price ?? 0) >= min)
  if (typeof max === 'number') filtered = filtered.filter((product) => (product.price ?? 0) <= max)

  filtered.sort((a, b) => {
    const priceA = a.price ?? 0
    const priceB = b.price ?? 0
    const ratingA = getProductRating(a)
    const ratingB = getProductRating(b)
    const newA = isNewProduct(a) ? 1 : 0
    const newB = isNewProduct(b) ? 1 : 0
    const discountA = a.oldPrice && a.oldPrice > priceA ? Math.round(((a.oldPrice - priceA) / a.oldPrice) * 100) : 0
    const discountB = b.oldPrice && b.oldPrice > priceB ? Math.round(((b.oldPrice - priceB) / b.oldPrice) * 100) : 0

    switch (sort) {
      case 'price_asc':
        return priceA - priceB
      case 'price_desc':
        return priceB - priceA
      case 'rating':
        return ratingB - ratingA
      case 'promo':
        return discountB - discountA
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
    if (sort !== 'new') sp.set('sort', sort)
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

  const itemListLd = jsonLdItemList({
    name: `${displayCategory} – TechPlay`,
    description: `Produits de la catégorie ${displayCategory}.`,
    url: `/categorie/${category}`,
    items: pageItems.map((p) => ({
      name: (p as Product).title ?? 'Produit',
      url: `/products/${(p as Product).slug ?? ''}`,
    })),
  })

  return (
    <main className="max-w-7xl mx-auto px-4 pt-28 pb-20" aria-labelledby="category-title" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <div className="mb-10 text-center">
        <h1
          id="category-title"
          className="inline-flex items-center gap-3 text-4xl font-extrabold tracking-tight text-brand dark:text-brand-light sm:text-5xl"
        >
          {CatIcon && <CatIcon className="opacity-90" />}
          {displayCategory}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Découvrez notre sélection dans la catégorie « {displayCategory} ».
        </p>
      </div>

      <form method="GET" className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher dans cette catégorie…"
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          aria-label="Rechercher"
        />

        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
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
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
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
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label="Prix maximum"
            min={0}
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
          >
            Filtrer
          </button>
        </div>

        {(q || sort !== 'new' || min !== undefined || max !== undefined || page > 1) && (
          <div className="lg:col-span-4">
            <Link
              href={`/categorie/${category}`}
              className="inline-block text-[13px] text-gray-600 transition hover:text-[hsl(var(--accent))] dark:text-gray-400"
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}
      </form>

      <ProductGrid
        products={pageItems}
        listName={LIST_NAMES.CATEGORY}
        emptyMessage={`Aucun produit trouvé dans la catégorie "${displayCategory}".`}
      />

      <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[13px]">
        {hasPrev ? (
          <Link className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2" href={buildUrl(page - 1)}>
            ← Précédent
          </Link>
        ) : (
          <span className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 opacity-40">← Précédent</span>
        )}

        <span className="px-2">
          Page <strong>{page}</strong> / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </span>

        {hasNext ? (
          <Link className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2" href={buildUrl(page + 1)}>
            Suivant →
          </Link>
        ) : (
          <span className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 opacity-40">Suivant →</span>
        )}
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
    </main>
  )
}