'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import type { Product } from '@/types/product'

export type ProductFilterSort = 'new' | 'price_asc' | 'price_desc' | 'rating' | 'promo';

interface ProductFilterInitial {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  ratingMin?: string;
  onlyNew?: boolean;
  onlyPromo?: boolean;
  sort?: ProductFilterSort;
}

interface ProductFilterProps {
  products?: Product[];
  onFilter?: (filtered: Product[]) => void;
  initial?: ProductFilterInitial;
}

export default function ProductFilter({
  products = [],
  onFilter,
  initial = {},
}: ProductFilterProps) {
  const t = useTranslations('common')
  const tFilters = useTranslations('filters')
  const tSort = useTranslations('sort')
  const [q, setQ] = useState(initial.q ?? '');
  const [selectedCategory, setSelectedCategory] = useState(initial.category ?? '');
  const [minPrice, setMinPrice] = useState(
    typeof initial.minPrice === 'number' ? String(initial.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    typeof initial.maxPrice === 'number' ? String(initial.maxPrice) : ''
  );
  const [ratingMin, setRatingMin] = useState(initial.ratingMin ?? '');
  const [onlyNew, setOnlyNew] = useState(Boolean(initial.onlyNew));
  const [onlyPromo, setOnlyPromo] = useState(Boolean(initial.onlyPromo));
  const [sort, setSort] = useState<ProductFilterSort>(initial.sort ?? 'new');

  // --------- catégories uniques triées (stable)
  const categories = useMemo(() => {
    const set = new Set(
      (products || [])
        .map((p) => (p?.category ?? '').trim())
        .filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // --------- calcul filtré + trié
  const filtered = useMemo(() => {
    let res = (products || []).filter(Boolean);

    // recherche
    const needle = q.trim().toLowerCase();
    if (needle) {
      res = res.filter((p) => {
        const hay =
          `${p?.title ?? ''} ${p?.description ?? ''} ${
            Array.isArray(p?.tags) ? p.tags.join(' ') : ''
          }`.toLowerCase();
        return hay.includes(needle);
      });
    }

    // catégorie
    if (selectedCategory) {
      res = res.filter((p) => (p?.category ?? '') === selectedCategory);
    }

    // prix
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!Number.isNaN(min) && minPrice !== '') {
      res = res.filter((p) => (p?.price ?? 0) >= min);
    }
    if (!Number.isNaN(max) && maxPrice !== '') {
      res = res.filter((p) => (p?.price ?? 0) <= max);
    }

    // note minimale
    if (ratingMin) {
      const r = Number(ratingMin);
      res = res.filter((p) => (p?.rating ?? 0) >= r);
    }

    // nouveautés / promos
    if (onlyNew) {
      res = res.filter((p) => Boolean(p?.isNew));
    }
    if (onlyPromo) {
      res = res.filter((p) => {
        const price = p?.price ?? 0;
        const old = p?.oldPrice ?? 0;
        return old > price;
      });
    }

    // tri
    res.sort((a, b) => {
      const pa = a?.price ?? 0;
      const pb = b?.price ?? 0;
      const ra = a?.rating ?? 0;
      const rb = b?.rating ?? 0;
      const newA = a?.isNew ? 1 : 0;
      const newB = b?.isNew ? 1 : 0;
      const discA = a?.oldPrice && a.oldPrice > pa ? (a.oldPrice - pa) / a.oldPrice : 0;
      const discB = b?.oldPrice && b.oldPrice > pb ? (b.oldPrice - pb) / b.oldPrice : 0;

      switch (sort) {
        case 'price_asc':
          return pa - pb;
        case 'price_desc':
          return pb - pa;
        case 'rating':
          return rb - ra;
        case 'promo':
          return discB - discA;
        case 'new':
        default:
          return newB - newA;
      }
    });

    return res;
  }, [products, q, selectedCategory, minPrice, maxPrice, ratingMin, onlyNew, onlyPromo, sort]);

  // notifier le parent à chaque changement
  useEffect(() => {
    onFilter?.(filtered);
  }, [filtered, onFilter]);

  // reset
  const reset = () => {
    setQ('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRatingMin('');
    setOnlyNew(false);
    setOnlyPromo(false);
    setSort('new');
  };

  // --------- UI
  return (
    <section
      className="mb-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 sm:p-5 shadow-[var(--shadow-sm)]"
      aria-label={tFilters('filters_aria')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        {/* Recherche */}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{tFilters('search_label')}</span>
          <input
            type="search"
            inputMode="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tFilters('placeholder_name')}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={tFilters('search_product_aria')}
          />
        </label>

        {/* Catégorie */}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{tFilters('category_label')}</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={tFilters('filter_category_aria')}
          >
            <option value="">{tFilters('all_categories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        {/* Prix min */}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{tFilters('price_min')}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={tFilters('price_min_aria')}
          />
        </label>

        {/* Prix max */}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{tFilters('price_max')}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="999"
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={tFilters('price_max_aria')}
          />
        </label>

        {/* Note min */}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{tFilters('rating_min')}</span>
          <select
            value={ratingMin}
            onChange={(e) => setRatingMin(e.target.value)}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={tFilters('filter_rating_aria')}
          >
            <option value="">{tFilters('all_ratings')}</option>
            <option value="3">≥ 3★</option>
            <option value="4">≥ 4★</option>
            <option value="4.5">≥ 4.5★</option>
          </select>
        </label>

        {/* Tri */}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{tFilters('sort_by')}</span>
          <select
            value={sort}
            onChange={(e) => setSort((e.target.value || 'new') as ProductFilterSort)}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={tFilters('sort_products_aria')}
          >
            <option value="new">{tSort('newest')}</option>
            <option value="price_asc">{tSort('price_asc')}</option>
            <option value="price_desc">{tSort('price_desc')}</option>
            <option value="rating">{tSort('rating')}</option>
            <option value="promo">{tSort('promo')}</option>
          </select>
        </label>
      </div>

      {/* Toggles + actions */}
      <div className="mt-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={onlyNew}
              onChange={(e) => setOnlyNew(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--accent))]"
              aria-label={tFilters('new_only_aria')}
            />
            {tSort('newest')}
          </label>
          <label className="inline-flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={onlyPromo}
              onChange={(e) => setOnlyPromo(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--accent))]"
              aria-label={tFilters('promo_only_aria')}
            />
            {tFilters('on_sale')}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-token-text/60">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-medium transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            aria-label={t('reset_filters')}
          >
            {t('reset_filters')}
          </button>
        </div>
      </div>
    </section>
  );
}
