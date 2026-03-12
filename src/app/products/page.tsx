import type { Metadata } from 'next'

import ProductCatalogue, { type CatalogueSort } from '@/components/ProductCatalogue'
import { getAllProducts } from '@/lib/data'
import { generateMeta } from '@/lib/seo'


type SortKey = 'new' | 'price_asc' | 'price_desc'

type Query = {
  q?: string
  sort?: SortKey | string
  page?: string | number
  min?: string | number
  max?: string | number
  cat?: string
}

function isPromiseLike<T>(value: unknown): value is Promise<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

async function resolveSearchParams(
  searchParams?: Promise<Query> | Query
): Promise<Query | undefined> {
  if (isPromiseLike<Query>(searchParams)) return await searchParams
  return searchParams
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
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : NaN

  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeSort(value: unknown): SortKey {
  const sort = readString(value, 'new')
  if (sort === 'price_asc' || sort === 'price_desc' || sort === 'new') return sort
  return 'new'
}

function normalizeSearchParams(sp?: Query) {
  const q = readString(sp?.q).trim()
  const sort = normalizeSort(sp?.sort)
  const cat = readString(sp?.cat).trim()
  const min = readNumber(sp?.min)
  const max = readNumber(sp?.max)

  return {
    q,
    sort,
    cat: cat || '',
    min,
    max,
  }
}

function mapCatalogueSort(sort: SortKey): CatalogueSort {
  if (sort === 'price_asc') return 'asc'
  if (sort === 'price_desc') return 'desc'
  return 'alpha'
}

export const revalidate = 300

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Query> | Query
}): Promise<Metadata> {
  const sp = await resolveSearchParams(searchParams)
  const query = normalizeSearchParams(sp)

  const bits: string[] = []

  if (query.q) bits.push(`Recherche "${query.q}"`)
  if (query.cat) bits.push(`Catégorie ${query.cat}`)
  if (typeof query.min === 'number' || typeof query.max === 'number') {
    bits.push(
      `Prix${typeof query.min === 'number' ? ` min ${query.min}€` : ''}${
        typeof query.max === 'number' ? ` max ${query.max}€` : ''
      }`
    )
  }

  if (query.sort === 'price_asc') bits.push('Prix croissant')
  if (query.sort === 'price_desc') bits.push('Prix décroissant')

  const title = bits.length
    ? `Catalogue produits — ${bits.join(' · ')}`
    : 'Catalogue produits TechPlay'

  const description = query.q
    ? `Découvrez les produits TechPlay correspondant à la recherche "${query.q}".`
    : 'Découvrez le catalogue complet TechPlay : produits high-tech, accessoires, nouveautés et meilleures ventes.'

  return generateMeta({
    title,
    description,
    url: '/products',
    image: '/og-products.jpg',
  })
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Query> | Query
}) {
  const products = await getAllProducts()
  const sp = await resolveSearchParams(searchParams)
  const query = normalizeSearchParams(sp)

  return (
    <>
      <ProductCatalogue
        products={products}
        initialQuery={query.q}
        initialCategory={query.cat || null}
        initialSort={mapCatalogueSort(query.sort)}
        initialMin={query.min}
        initialMax={query.max}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Catalogue produits TechPlay',
            description: 'Catalogue complet des produits high-tech TechPlay.',
            url: '/products',
          }),
        }}
      />
    </>
  )
}