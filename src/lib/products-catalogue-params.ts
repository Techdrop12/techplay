/**
 * Logique partagée pour les pages catalogue produits (query params, tri, metadata).
 * Utilisé par /products et /[locale]/products.
 */

import type { CatalogueSort } from '@/components/ProductCatalogue';

export type ProductsSortKey = 'new' | 'price_asc' | 'price_desc';

export interface ProductsCatalogueQuery {
  q?: string;
  sort?: ProductsSortKey | string;
  page?: string | number;
  min?: string | number;
  max?: string | number;
  cat?: string;
}

export interface NormalizedProductsQuery {
  q: string;
  sort: ProductsSortKey;
  cat: string;
  min: number | undefined;
  max: number | undefined;
}

export function isPromiseLike<T>(value: unknown): value is Promise<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

export async function resolveSearchParams(
  searchParams?: Promise<ProductsCatalogueQuery> | ProductsCatalogueQuery
): Promise<ProductsCatalogueQuery | undefined> {
  if (isPromiseLike<ProductsCatalogueQuery>(searchParams)) return await searchParams;
  return searchParams;
}

function readString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function readNumber(value: unknown): number | undefined {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeSort(value: unknown): ProductsSortKey {
  const sort = readString(value, 'new');
  if (sort === 'price_asc' || sort === 'price_desc' || sort === 'new') return sort;
  return 'new';
}

export function normalizeProductsSearchParams(
  sp?: ProductsCatalogueQuery
): NormalizedProductsQuery {
  const q = readString(sp?.q).trim();
  const sort = normalizeSort(sp?.sort);
  const cat = readString(sp?.cat).trim();
  const min = readNumber(sp?.min);
  const max = readNumber(sp?.max);
  return { q, sort, cat: cat || '', min, max };
}

export function mapProductsSortToCatalogue(sort: ProductsSortKey): CatalogueSort {
  if (sort === 'price_asc') return 'asc';
  if (sort === 'price_desc') return 'desc';
  return 'alpha';
}

/** Construit les titres/descriptions pour generateMetadata (texte FR, cohérent avec l’existant). */
export function buildProductsPageMetaStrings(query: NormalizedProductsQuery): {
  title: string;
  description: string;
} {
  const bits: string[] = [];
  if (query.q) bits.push(`Recherche "${query.q}"`);
  if (query.cat) bits.push(`Catégorie ${query.cat}`);
  if (typeof query.min === 'number' || typeof query.max === 'number') {
    bits.push(
      `Prix${typeof query.min === 'number' ? ` min ${query.min}€` : ''}${
        typeof query.max === 'number' ? ` max ${query.max}€` : ''
      }`
    );
  }
  if (query.sort === 'price_asc') bits.push('Prix croissant');
  if (query.sort === 'price_desc') bits.push('Prix décroissant');

  const title =
    bits.length > 0 ? `Catalogue produits — ${bits.join(' · ')}` : 'Catalogue produits TechPlay';

  const description = query.q
    ? `Découvrez les produits TechPlay correspondant à la recherche "${query.q}".`
    : 'Découvrez le catalogue complet TechPlay : produits high-tech, accessoires, nouveautés et meilleures ventes.';

  return { title, description };
}
