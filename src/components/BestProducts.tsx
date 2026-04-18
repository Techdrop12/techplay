'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';

import type { Product } from '@/types/product';

import ProductCard from '@/components/ProductCard';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';
import { cn } from '@/lib/utils';

type SortKey = 'popular' | 'priceAsc' | 'priceDesc' | 'rating';
type ProductRecord = Record<string, unknown>;

interface BestProductsProps {
  products: Product[];
  showTitle?: boolean;
  title?: string;
  limit?: number;
  className?: string;
  showControls?: boolean;
  initialSort?: SortKey;
  autoLoadOnIntersect?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const sectionStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '900px',
};

function isRecord(value: unknown): value is ProductRecord {
  return typeof value === 'object' && value !== null;
}

function toRecord(value: unknown): ProductRecord {
  return isRecord(value) ? value : {};
}

function readString(record: ProductRecord, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function readNumber(record: ProductRecord, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    const parsed =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : NaN;

    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readBoolean(record: ProductRecord, keys: readonly string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function readFirstImage(record: ProductRecord): string | undefined {
  const direct = readString(record, ['image']);
  if (direct) return direct;

  const images = record.images;
  if (Array.isArray(images)) {
    const first = images.find(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
    if (first) return first;
  }

  const gallery = record.gallery;
  if (Array.isArray(gallery)) {
    const first = gallery.find(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
    if (first) return first;
  }

  return undefined;
}

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
    window.dataLayer.push({ event, ...(payload ?? {}) });
  } catch {
    // no-op
  }
}

function getPrice(product: Product): number {
  return typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0;
}

function getCompareAt(product: Product): number | undefined {
  const record = toRecord(product);
  return readNumber(record, ['compareAtPrice', 'oldPrice', 'referencePrice', 'originalPrice']);
}

function getRating(product: Product): number {
  if (product.aggregateRating && typeof product.aggregateRating.average === 'number') {
    return Math.max(0, Math.min(5, product.aggregateRating.average));
  }

  if (typeof product.rating === 'number' && Number.isFinite(product.rating)) {
    return Math.max(0, Math.min(5, product.rating));
  }

  return 0;
}

function getPopularity(product: Product): number {
  const record = toRecord(product);
  const explicitSales = readNumber(record, ['sales', 'sold', 'ordersCount']);
  if (typeof explicitSales === 'number') return explicitSales;

  const reviews =
    typeof product.reviewsCount === 'number'
      ? product.reviewsCount
      : (product.aggregateRating?.total ?? 0);

  const ratingBoost = getRating(product) * 10;
  const featuredBoost = readBoolean(record, ['featured', 'isBestSeller']) ? 50 : 0;

  return reviews + ratingBoost + featuredBoost;
}

function isPromo(product: Product): boolean {
  const current = getPrice(product);
  const compareAt = getCompareAt(product);

  return typeof compareAt === 'number' && compareAt > current;
}

function isInStock(product: Product): boolean {
  if (typeof product.stock === 'number') return product.stock > 0;

  const record = toRecord(product);
  const stock = readNumber(record, ['quantity', 'qty']);
  const available = readBoolean(record, ['available']);

  if (typeof stock === 'number') return stock > 0;
  if (typeof available === 'boolean') return available;

  return true;
}

function normalizeProduct(product: Product): Product {
  const record = toRecord(product);

  return {
    ...product,
    title: product.title?.trim() || readString(record, ['name']) || 'Produit',
    image: readFirstImage(record) || '/og-image.jpg',
  };
}

export default function BestProducts({
  products,
  showTitle = false,
  title = 'Nos Meilleures Ventes',
  limit = 8,
  className,
  showControls = true,
  initialSort = 'popular',
  autoLoadOnIntersect = true,
}: BestProductsProps) {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const reduceMotion = useReducedMotion();
  const tProductList = useTranslations('product_list');
  const tCommon = useTranslations('common');

  const t = useMemo(() => {
    if (locale === 'en') {
      return {
        sub: 'Community favorites — limited stock.',
        display: 'Showing',
        promo: 'On sale',
        inStock: 'In stock',
        reset: 'Reset',
        empty: 'No products match the current filters.',
        titleFallback: 'Best sellers',
        filterPromoAria: 'Filter: on sale',
        filterStockAria: 'Filter: in stock',
        sortLabel: 'Sort products',
        sort: {
          popular: 'Popularity',
          priceAsc: 'Price ↑',
          priceDesc: 'Price ↓',
          rating: 'Rating',
        },
        sortAnnounce: (k: SortKey) =>
          `Sorted by ${
            k === 'popular'
              ? 'popularity'
              : k === 'priceAsc'
                ? 'price ascending'
                : k === 'priceDesc'
                  ? 'price descending'
                  : 'rating'
          }.`,
        filterPromoAnnounce: (on: boolean) => `Sale filter ${on ? 'enabled' : 'disabled'}.`,
        filterStockAnnounce: (on: boolean) => `In-stock filter ${on ? 'enabled' : 'disabled'}.`,
        resetAnnounce: 'Filters reset.',
        seeMore: 'Show more',
        allShown: 'All products are displayed.',
        moreShown: (n: number) => `${n} additional products displayed.`,
        loading: 'Loading best sellers…',
        noscript: 'See all products',
      };
    }

    return {
      sub: 'Les favoris de la communauté — stock limité.',
      display: 'Affichage',
      promo: 'Promo',
      inStock: 'En stock',
      reset: 'Réinitialiser',
      empty: 'Aucun produit ne correspond aux filtres actuels.',
      titleFallback: 'Nos Meilleures Ventes',
      filterPromoAria: 'Filtrer : en promotion',
      filterStockAria: 'Filtrer : en stock',
      sortLabel: 'Trier les produits',
      sort: {
        popular: 'Popularité',
        priceAsc: 'Prix ↑',
        priceDesc: 'Prix ↓',
        rating: 'Note',
      },
      sortAnnounce: (k: SortKey) =>
        `Tri par ${
          k === 'popular'
            ? 'popularité'
            : k === 'priceAsc'
              ? 'prix croissant'
              : k === 'priceDesc'
                ? 'prix décroissant'
                : 'note'
        }.`,
      filterPromoAnnounce: (on: boolean) => `Filtre promotion ${on ? 'activé' : 'désactivé'}.`,
      filterStockAnnounce: (on: boolean) => `Filtre en stock ${on ? 'activé' : 'désactivé'}.`,
      resetAnnounce: 'Filtres réinitialisés.',
      seeMore: 'Voir plus',
      allShown: 'Tous les produits sont affichés.',
      moreShown: (n: number) => `${n} produits supplémentaires affichés.`,
      loading: 'Chargement des meilleures ventes…',
      noscript: 'Voir tous les produits',
    };
  }, [locale]);

  const headingId = useId();
  const subId = `${headingId}-sub`;
  const gridId = `${headingId}-grid`;
  const liveId = `${headingId}-live`;

  const [expanded, setExpanded] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>(initialSort);
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterStock, setFilterStock] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean).map(normalizeProduct) : []),
    [products]
  );

  const filteredSorted = useMemo(() => {
    let arr = [...safeProducts];

    if (filterPromo) arr = arr.filter(isPromo);
    if (filterStock) arr = arr.filter(isInStock);

    arr.sort((a, b) => {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      const ratingA = getRating(a);
      const ratingB = getRating(b);
      const popA = getPopularity(a);
      const popB = getPopularity(b);

      switch (sortBy) {
        case 'priceAsc':
          return priceA - priceB;
        case 'priceDesc':
          return priceB - priceA;
        case 'rating':
          return ratingB - ratingA || popB - popA;
        case 'popular':
        default:
          return popB - popA || ratingB - ratingA;
      }
    });

    return arr;
  }, [safeProducts, sortBy, filterPromo, filterStock]);

  const list = useMemo(() => {
    if (!limit || expanded) return filteredSorted;
    return filteredSorted.slice(0, limit);
  }, [filteredSorted, limit, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const remaining = Math.max(0, filteredSorted.length - (limit || 0));
    if (remaining > 0) setAnnounce(t.moreShown(remaining));
  }, [expanded, filteredSorted.length, limit, t]);

  useEffect(() => {
    if (!autoLoadOnIntersect || expanded) return;

    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setExpanded(true);
          pushDL('best_products_autoload');
        }
      },
      { threshold: 0.25, rootMargin: '120px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [autoLoadOnIntersect, expanded]);

  if (safeProducts.length === 0) {
    return (
      <section className={cn('mx-auto max-w-6xl px-4 py-10', className)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" aria-hidden="true" />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-token-text/70" role="status" aria-live="polite">
          {tProductList('loading_products')}
        </p>
      </section>
    );
  }

  const totalCount = filteredSorted.length;
  const visibleCount = list.length;
  const activeFilters = filterPromo || filterStock;

  return (
    <section
      className={cn('mx-auto max-w-6xl px-4 py-10', className)}
      aria-labelledby={showTitle ? headingId : undefined}
      role="region"
      style={sectionStyle}
    >
      {showTitle && (
        <>
          <h2 id={headingId} className="mb-2 text-center heading-section">
            {title || t.titleFallback}
          </h2>

          <p id={subId} className="mb-6 text-center text-sm text-token-text/70">
            {t.sub}
            <span className="sr-only"> {totalCount} produits disponibles.</span>
          </p>
        </>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/70 p-3">
        <div className="text-xs text-token-text/70" aria-live="polite">
          {t.display} <span className="font-semibold">{visibleCount}</span> /{' '}
          <span>{totalCount}</span>
        </div>

        {showControls && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFilterPromo((current) => {
                  const next = !current;
                  setAnnounce(t.filterPromoAnnounce(next));
                  pushDL('best_products_filter', { promo: next });
                  return next;
                });
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterPromo
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-token-border bg-token-surface hover:shadow'
              )}
              aria-pressed={filterPromo}
              aria-controls={gridId}
              aria-label={t.filterPromoAria}
            >
              {t.promo}
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterStock((current) => {
                  const next = !current;
                  setAnnounce(t.filterStockAnnounce(next));
                  pushDL('best_products_filter', { stock: next });
                  return next;
                });
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filterStock
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]'
                  : 'border-token-border bg-token-surface hover:shadow'
              )}
              aria-pressed={filterStock}
              aria-controls={gridId}
              aria-label={t.filterStockAria}
            >
              {t.inStock}
            </button>

            <label className="sr-only" htmlFor={`${headingId}-sort`}>
              {t.sortLabel}
            </label>

            <select
              id={`${headingId}-sort`}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[12px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              value={sortBy}
              onChange={(e) => {
                const next = (e.currentTarget.value as SortKey) || 'popular';
                setSortBy(next);
                setAnnounce(t.sortAnnounce(next));
                pushDL('best_products_sort', { sort: next });
              }}
              aria-label={t.sortLabel}
              aria-controls={gridId}
            >
              <option value="popular">{t.sort.popular}</option>
              <option value="priceAsc">{t.sort.priceAsc}</option>
              <option value="priceDesc">{t.sort.priceDesc}</option>
              <option value="rating">{t.sort.rating}</option>
            </select>

            {activeFilters ? (
              <button
                type="button"
                onClick={() => {
                  setFilterPromo(false);
                  setFilterStock(false);
                  setAnnounce(t.resetAnnounce);
                  pushDL('best_products_reset_filters');
                }}
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-xs font-semibold transition hover:shadow"
              >
                {tCommon('reset_filters')}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="rounded-3xl border border-token-border bg-token-surface/70 px-6 py-12 text-center shadow-soft">
          <p className="text-sm font-semibold text-token-text">{t.empty}</p>
        </div>
      ) : (
        <motion.ul
          {...(!reduceMotion
            ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' }
            : {})}
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
          role="list"
          aria-describedby={showTitle ? subId : undefined}
          id={gridId}
        >
          {list.map((product, i) => {
            const record = toRecord(product);
            const key = readString(record, ['_id', 'slug', 'id']) ?? `bp-${i}`;

            return (
              <motion.li
                key={key}
                {...(!reduceMotion ? { variants: itemVariants } : {})}
                role="listitem"
                data-gtm="best_products_item"
                data-idx={i}
              >
                <ProductCard product={product} priority={i < 2} />
              </motion.li>
            );
          })}
        </motion.ul>
      )}

      {!expanded && limit > 0 && totalCount > limit && (
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setExpanded(true);
              setAnnounce(t.allShown);
              pushDL('best_products_see_more_click');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-controls={gridId}
            aria-expanded={expanded ? 'true' : 'false'}
          >
            {t.seeMore}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="opacity-80"
            >
              <path fill="currentColor" d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {autoLoadOnIntersect ? (
            <div ref={sentinelRef} className="h-px w-full opacity-0" aria-hidden="true" />
          ) : null}
        </div>
      )}

      <p id={liveId} className="sr-only" aria-live="polite">
        {announce}
      </p>

      <noscript>
        <p className="mt-6 text-center">
          <a href={localizePath('/products', locale)}>{t.noscript}</a>
        </p>
      </noscript>
    </section>
  );
}
