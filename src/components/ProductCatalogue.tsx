'use client'

import Fuse from 'fuse.js'
import { usePathname } from 'next/navigation'
import { useDeferredValue, useMemo, useState } from 'react'

import type { Product } from '@/types/product'

import Analytics from '@/components/Analytics'
import BackToTopButton from '@/components/BackToTopButton'
import FilterPanel from '@/components/catalogue/FilterPanel'
import SearchBar from '@/components/catalogue/SearchBar'
import SortDropdown from '@/components/catalogue/SortDropdown'
import MetaPixel from '@/components/MetaPixel'
import ProductGrid from '@/components/ProductGrid'
import ScrollToTop from '@/components/ScrollToTop'
import SectionTitle from '@/components/SectionTitle'
import SectionWrapper from '@/components/SectionWrapper'
import { getCurrentLocale } from '@/lib/i18n-routing'
import { cn } from '@/lib/utils'

export type CatalogueSort = 'asc' | 'desc' | 'alpha'

type Props = {
  products: Product[]
  initialQuery?: string
  initialCategory?: string | null
  initialSort?: CatalogueSort
  initialMin?: number
  initialMax?: number
}

type SearchDoc = {
  product: Product
  title: string
  category: string
  brand: string
  tags: string
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function getTags(product: Product): string[] {
  const raw = (product as Record<string, unknown>).tags

  if (Array.isArray(raw)) {
    return raw.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
  }

  if (typeof raw === 'string' && raw.trim()) {
    return [raw.trim()]
  }

  return []
}

function getCategoryLabel(product: Product, locale: 'fr' | 'en'): string {
  const category =
    typeof product.category === 'string' && product.category.trim()
      ? product.category.trim()
      : locale === 'en'
        ? 'Other'
        : 'Autre'

  return category
}

function getPrice(product: Product): number {
  return typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0
}

export default function ProductCatalogue({
  products,
  initialQuery = '',
  initialCategory = null,
  initialSort = 'alpha',
  initialMin,
  initialMax,
}: Props) {
  const pathname = usePathname() || '/'
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'

  const t =
    locale === 'en'
      ? {
          title: 'TechPlay Catalogue',
          subtitle: 'Find the right product faster with smart search, filters and sorting.',
          results: 'results',
          searchResults: 'Search results',
          noResults: 'No products found.',
          noResultsHint: 'Try another keyword, category, or sorting option.',
          clearFilters: 'Clear filters',
          allCategories: 'All categories',
          activeCategory: 'Selected category',
          activePrice: 'Active price filter',
        }
      : {
          title: 'Catalogue TechPlay',
          subtitle: 'Trouvez plus vite le bon produit grâce à la recherche, aux filtres et au tri.',
          results: 'résultat(s)',
          searchResults: 'Résultats de recherche',
          noResults: 'Aucun produit trouvé.',
          noResultsHint: 'Essaie un autre mot-clé, une autre catégorie ou un autre tri.',
          clearFilters: 'Réinitialiser les filtres',
          allCategories: 'Toutes les catégories',
          activeCategory: 'Catégorie sélectionnée',
          activePrice: 'Filtre prix actif',
        }

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products]
  )

  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setCategory] = useState<string | null>(initialCategory)
  const [sortOption, setSortOption] = useState<CatalogueSort>(initialSort)

  const deferredQuery = useDeferredValue(query)

  const searchableDocs = useMemo<SearchDoc[]>(
    () =>
      safeProducts.map((product) => ({
        product,
        title: product.title?.trim() || '',
        category: getCategoryLabel(product, locale),
        brand: typeof product.brand === 'string' ? product.brand.trim() : '',
        tags: getTags(product).join(' '),
      })),
    [safeProducts, locale]
  )

  const fuse = useMemo(
    () =>
      new Fuse(searchableDocs, {
        keys: ['title', 'category', 'brand', 'tags'],
        threshold: 0.28,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchableDocs]
  )

  const categories = useMemo(() => {
    const map = new Map<string, string>()

    for (const product of safeProducts) {
      const label = getCategoryLabel(product, locale)
      const normalized = normalizeText(label)

      if (!map.has(normalized)) {
        map.set(normalized, label)
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, locale === 'en' ? 'en' : 'fr', { sensitivity: 'base' })
    )
  }, [safeProducts, locale])

  const filteredProducts = useMemo(() => {
    const searched = deferredQuery.trim()
      ? fuse.search(deferredQuery.trim()).map((result) => result.item.product)
      : safeProducts

    const deduped = Array.from(
      new Map(
        searched.map((product, index) => [String(product._id || product.slug || `idx-${index}`), product])
      ).values()
    )

    const categoryFiltered = selectedCategory
      ? deduped.filter(
          (product) =>
            normalizeText(getCategoryLabel(product, locale)) === normalizeText(selectedCategory)
        )
      : deduped

    const priceFiltered = categoryFiltered.filter((product) => {
      const price = getPrice(product)
      if (typeof initialMin === 'number' && price < initialMin) return false
      if (typeof initialMax === 'number' && price > initialMax) return false
      return true
    })

    const sorted = [...priceFiltered].sort((a, b) => {
      if (sortOption === 'asc') return getPrice(a) - getPrice(b)
      if (sortOption === 'desc') return getPrice(b) - getPrice(a)
      return (a.title ?? '').localeCompare(b.title ?? '', locale === 'en' ? 'en' : 'fr', {
        sensitivity: 'base',
      })
    })

    return sorted
  }, [deferredQuery, fuse, initialMax, initialMin, locale, safeProducts, selectedCategory, sortOption])

  const hasActiveFilters =
    query.trim().length > 0 ||
    !!selectedCategory ||
    typeof initialMin === 'number' ||
    typeof initialMax === 'number'

  return (
    <>
      <Analytics />
      <MetaPixel />
      <ScrollToTop />
      <BackToTopButton />

      <section className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-900 dark:text-white">
        <SectionWrapper>
          <div className="mb-8">
            <SectionTitle title={t.title} />
            <p className="mt-2 text-center text-sm text-token-text/70 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_auto_auto] xl:items-end">
            <SearchBar query={query} setQuery={setQuery} products={safeProducts} />

            <FilterPanel
              categories={categories}
              selected={selectedCategory}
              setSelected={setCategory}
            />

            <SortDropdown sort={sortOption} setSort={setSortOption} />
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-token-border bg-token-surface/70 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-token-text">
                {filteredProducts.length} {t.results}
              </p>

              <p className="mt-1 text-xs text-token-text/70">
                {query.trim() ? `${t.searchResults} : “${query.trim()}”` : t.allCategories}
                {selectedCategory ? ` · ${t.activeCategory} : ${selectedCategory}` : ''}
                {typeof initialMin === 'number' || typeof initialMax === 'number'
                  ? ` · ${t.activePrice} : ${typeof initialMin === 'number' ? `${initialMin}€` : '0€'} - ${
                      typeof initialMax === 'number' ? `${initialMax}€` : '∞'
                    }`
                  : ''}
              </p>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setCategory(null)
                }}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl border border-token-border',
                  'bg-token-surface px-4 py-2 text-sm font-semibold transition',
                  'hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]'
                )}
              >
                {t.clearFilters}
              </button>
            ) : null}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-token-border bg-token-surface/70 px-6 py-14 text-center shadow-soft">
              <p className="text-lg font-semibold text-token-text">{t.noResults}</p>
              <p className="mt-2 text-sm text-token-text/70">{t.noResultsHint}</p>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              className="mt-2"
              listName="catalogue_products"
              id="catalogue-products-grid"
            />
          )}
        </SectionWrapper>
      </section>
    </>
  )
}