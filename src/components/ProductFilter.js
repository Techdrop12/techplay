'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * ProductFilter — filtre côté client (recherche, catégorie, prix, rating, promo, nouveautés, tri)
 *
 * Props:
 *  - products: Array<ProductLike>
 *  - onFilter: (filtered: ProductLike[]) => void
 *  - initial?: valeurs initiales des filtres (optionnel)
 */
export default function ProductFilter({ products = [], onFilter, initial = {} }) {
  // --------- état des filtres
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
  const [sort, setSort] = useState(initial.sort ?? 'new'); // 'new' | 'price_asc' | 'price_desc' | 'rating' | 'promo'

  // --------- dérivés
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => (p?.category ?? '').trim()))).filter(Boolean);
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
      className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5"
      aria-label="Filtres produits"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        {/* Recherche */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Recherche</span>
          <input
            type="search"
            inputMode="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom, mot-clé…"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Rechercher un produit"
          />
        </label>

        {/* Catégorie */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Catégorie</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        {/* Prix min */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Prix min (€)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Prix minimum"
          />
        </label>

        {/* Prix max */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Prix max (€)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="999"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Prix maximum"
          />
        </label>

        {/* Note min */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Note minimale</span>
          <select
            value={ratingMin}
            onChange={(e) => setRatingMin(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Filtrer par note minimale"
          >
            <option value="">Toutes</option>
            <option value="3">≥ 3★</option>
            <option value="4">≥ 4★</option>
            <option value="4.5">≥ 4.5★</option>
          </select>
        </label>

        {/* Tri */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Trier par</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Trier les produits"
          >
            <option value="new">Nouveautés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating">Meilleures notes</option>
            <option value="promo">Meilleures promos</option>
          </select>
        </label>
      </div>

      {/* Toggles + actions */}
      <div className="mt-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyNew}
              onChange={(e) => setOnlyNew(e.target.checked)}
              className="h-4 w-4 accent-accent"
              aria-label="Afficher uniquement les nouveautés"
            />
            Nouveautés
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyPromo}
              onChange={(e) => setOnlyPromo(e.target.checked)}
              className="h-4 w-4 accent-accent"
              aria-label="Afficher uniquement les articles en promotion"
            />
            En promo
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Réinitialiser tous les filtres"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </section>
  );
}
