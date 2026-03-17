'use client';

import Fuse from 'fuse.js';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useDeferredValue, useMemo, useState } from 'react';

import type { Product } from '@/types/product';

import Analytics from '@/components/Analytics';
import FilterPanel from '@/components/catalogue/FilterPanel';
import SearchBar from '@/components/catalogue/SearchBar';
import SortDropdown from '@/components/catalogue/SortDropdown';
import MetaPixel from '@/components/MetaPixel';
import ProductGrid from '@/components/ProductGrid';
import ScrollToTop from '@/components/ScrollToTop';
import SectionWrapper from '@/components/SectionWrapper';
import { LIST_NAMES } from '@/lib/analytics-events';
import { getCurrentLocale } from '@/lib/i18n-routing';
import { cn } from '@/lib/utils';

export type CatalogueSort = 'asc' | 'desc' | 'alpha';

type Props = {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string | null;
  initialSort?: CatalogueSort;
  initialMin?: number;
  initialMax?: number;
};

type SearchDoc = {
  product: Product;
  title: string;
  category: string;
  brand: string;
  tags: string;
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getTags(product: Product): string[] {
  const raw = (product as Record<string, unknown>).tags;

  if (Array.isArray(raw)) {
    return raw.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
  }

  if (typeof raw === 'string' && raw.trim()) {
    return [raw.trim()];
  }

  return [];
}

function getCategoryLabel(product: Product, locale: 'fr' | 'en'): string {
  const category =
    typeof product.category === 'string' && product.category.trim()
      ? product.category.trim()
      : locale === 'en'
        ? 'Other'
        : 'Autre';

  return category;
}

function getPrice(product: Product): number {
  return typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0;
}

export default function ProductCatalogue({
  products,
  initialQuery = '',
  initialCategory = null,
  initialSort = 'alpha',
  initialMin,
  initialMax,
}: Props) {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const tCommon = useTranslations('common');

  const t =
    locale === 'en'
      ? {
          kicker: 'Shop',
          title: 'Our tech & gaming selection',
          subtitle:
            'Keyboards, mice, headsets and accessories chosen to perform. Refine below to find your next upgrade.',
          refineLabel: 'Refine your selection',
          selectionHeading: 'Our selection',
          selectionSub: 'Hand-picked for performance.',
          results: 'results',
          productsCount: (n: number) => (n === 1 ? '1 product' : `${n} products`),
          searchResults: 'Search results',
          noResults: 'No products found.',
          noResultsHint: 'Try another keyword, category, or sort option.',
          allCategories: 'All categories',
          activeCategory: 'Selected category',
          activePrice: 'Active price filter',
        }
      : {
          kicker: 'Catalogue',
          title: 'Notre sélection tech & gaming',
          subtitle:
            'Claviers, souris, casques et accessoires choisis pour performer. Affinez ci-dessous pour trouver votre prochain upgrade.',
          refineLabel: 'Affiner votre sélection',
          selectionHeading: 'Notre sélection',
          selectionSub: 'Sélectionnés pour performer.',
          results: 'résultat(s)',
          productsCount: (n: number) => (n === 1 ? '1 produit' : `${n} produits`),
          searchResults: 'Résultats de recherche',
          noResults: 'Aucun produit trouvé.',
          noResultsHint: 'Essaie un autre mot-clé, une autre catégorie ou un autre tri.',
          allCategories: 'Toutes les catégories',
          activeCategory: 'Catégorie sélectionnée',
          activePrice: 'Filtre prix actif',
        };

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products]
  );

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setCategory] = useState<string | null>(initialCategory);
  const [sortOption, setSortOption] = useState<CatalogueSort>(initialSort);

  const deferredQuery = useDeferredValue(query);

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
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchableDocs, {
        keys: ['title', 'category', 'brand', 'tags'],
        threshold: 0.28,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchableDocs]
  );

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    for (const product of safeProducts) {
      const label = getCategoryLabel(product, locale);
      const normalized = normalizeText(label);

      if (!map.has(normalized)) {
        map.set(normalized, label);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, locale === 'en' ? 'en' : 'fr', { sensitivity: 'base' })
    );
  }, [safeProducts, locale]);

  const filteredProducts = useMemo(() => {
    const searched = deferredQuery.trim()
      ? fuse.search(deferredQuery.trim()).map((result) => result.item.product)
      : safeProducts;

    const deduped = Array.from(
      new Map(
        searched.map((product, index) => [
          String(product._id || product.slug || `idx-${index}`),
          product,
        ])
      ).values()
    );

    const categoryFiltered = selectedCategory
      ? deduped.filter(
          (product) =>
            normalizeText(getCategoryLabel(product, locale)) === normalizeText(selectedCategory)
        )
      : deduped;

    const priceFiltered = categoryFiltered.filter((product) => {
      const price = getPrice(product);
      if (typeof initialMin === 'number' && price < initialMin) return false;
      if (typeof initialMax === 'number' && price > initialMax) return false;
      return true;
    });

    const sorted = [...priceFiltered].sort((a, b) => {
      if (sortOption === 'asc') return getPrice(a) - getPrice(b);
      if (sortOption === 'desc') return getPrice(b) - getPrice(a);
      return (a.title ?? '').localeCompare(b.title ?? '', locale === 'en' ? 'en' : 'fr', {
        sensitivity: 'base',
      });
    });

    return sorted;
  }, [
    deferredQuery,
    fuse,
    initialMax,
    initialMin,
    locale,
    safeProducts,
    selectedCategory,
    sortOption,
  ]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    !!selectedCategory ||
    typeof initialMin === 'number' ||
    typeof initialMax === 'number';

  return (
    <>
      <Analytics />
      <MetaPixel />
      <ScrollToTop />

      <section className="min-h-screen bg-[hsl(var(--surface))] text-[hsl(var(--text))] transition-colors">
        <SectionWrapper>
          <header className="mx-auto max-w-3xl border-b border-[hsl(var(--border))]/60 pb-10 text-center sm:pb-12">
            {t.kicker ? <p className="heading-kicker">{t.kicker}</p> : null}
            <h1 className="heading-page mt-3 sm:[font-size:var(--step-4)] md:text-[2.25rem]">
              {t.title}
            </h1>
            <p className="mt-4 heading-section-sub font-medium">{t.subtitle}</p>
          </header>

          <section
            className="mt-10 rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-5 py-5 sm:px-6 sm:py-6"
            aria-labelledby="catalogue-refine-heading"
          >
            <h2 id="catalogue-refine-heading" className="sr-only">
              {t.refineLabel}
            </h2>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-token-text/60">
              {t.refineLabel}
            </p>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end xl:gap-6">
              <SearchBar query={query} setQuery={setQuery} products={safeProducts} />

              <FilterPanel
                categories={categories}
                selected={selectedCategory}
                setSelected={setCategory}
              />
            </div>
          </section>

          <section
            className="mt-8 rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/40"
            aria-labelledby="catalogue-selection-heading"
          >
            <div className="border-b border-[hsl(var(--border))]/60 px-5 py-4 sm:px-6">
              <h2
                id="catalogue-selection-heading"
                className="heading-subsection text-lg sm:text-xl"
              >
                {t.selectionHeading}
              </h2>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-token-text/75">
                {t.selectionSub}
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))]/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
              <p className="min-w-0 shrink-0 text-sm font-semibold tabular-nums text-[hsl(var(--text))] sm:text-[15px]">
                {typeof t.productsCount === 'function'
                  ? t.productsCount(filteredProducts.length)
                  : `${filteredProducts.length} ${t.results}`}
              </p>

              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3 sm:gap-4">
                <SortDropdown
                  sort={sortOption}
                  setSort={setSortOption}
                  locale={locale}
                  className="w-auto shrink-0"
                />
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setCategory(null);
                    }}
                    className={cn(
                      'shrink-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
                      'min-h-[2.75rem] px-4 py-2.5 text-[13px] font-semibold transition sm:min-h-0',
                      'hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2'
                    )}
                  >
                    {tCommon('reset_filters')}
                  </button>
                ) : null}
              </div>

              {/* Accessible filter summary for screen readers */}
              <div className="sr-only" aria-live="polite">
                <p>
                  {query.trim() ? `${t.searchResults} : “${query.trim()}”` : t.allCategories}
                  {selectedCategory ? ` · ${t.activeCategory} : ${selectedCategory}` : ''}
                  {typeof initialMin === 'number' || typeof initialMax === 'number'
                    ? ` · ${t.activePrice} : ${typeof initialMin === 'number' ? `${initialMin}€` : '0€'} - ${
                        typeof initialMax === 'number' ? `${initialMax}€` : '∞'
                      }`
                    : ''}
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
                <p className="text-lg font-semibold text-[hsl(var(--text))]">{t.noResults}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-token-text/70">
                  {t.noResultsHint}
                </p>
              </div>
            ) : (
              <div className="pb-8 pt-6 sm:pb-10 sm:pt-8">
                <ProductGrid
                  products={filteredProducts}
                  className="mt-0 w-full min-w-0"
                  listName={LIST_NAMES.CATALOGUE}
                  id="catalogue-products-grid"
                />
              </div>
            )}
          </section>
        </SectionWrapper>
      </section>
    </>
  );
}
