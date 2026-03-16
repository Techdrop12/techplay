import type { Metadata } from 'next';

import ProductCatalogue from '@/components/ProductCatalogue';
import { getAllProducts } from '@/lib/data';
import { isLocale, type Locale } from '@/lib/language';
import {
  resolveSearchParams,
  normalizeProductsSearchParams,
  mapProductsSortToCatalogue,
  buildProductsPageMetaStrings,
  type ProductsCatalogueQuery,
} from '@/lib/products-catalogue-params';
import { generateMeta, absoluteUrl } from '@/lib/seo';

export const revalidate = 300;

type PageProps = {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<ProductsCatalogueQuery> | ProductsCatalogueQuery;
};

function productsPathForLocale(locale: Locale): string {
  return locale !== 'fr' ? `/${locale}/products` : '/products';
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await (params ?? Promise.resolve({ locale: 'fr' }));
  const sp = await resolveSearchParams(searchParams);
  const query = normalizeProductsSearchParams(sp);
  const { title, description } = buildProductsPageMetaStrings(query);
  const path = isLocale(locale) && locale !== 'fr' ? `/${locale}/products` : '/products';
  return generateMeta({
    title,
    description,
    url: path,
    image: '/og-products.jpg',
  });
}

export default async function LocaleProductsPage({ params, searchParams }: PageProps) {
  const products = await getAllProducts();
  const sp = await resolveSearchParams(searchParams);
  const query = normalizeProductsSearchParams(sp);
  const resolvedParams = await (params ?? Promise.resolve({ locale: 'fr' }));
  const locale: Locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : 'fr';
  const path = productsPathForLocale(locale);

  return (
    <>
      <ProductCatalogue
        products={products}
        initialQuery={query.q}
        initialCategory={query.cat || null}
        initialSort={mapProductsSortToCatalogue(query.sort)}
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
            url: absoluteUrl(path),
          }),
        }}
      />
    </>
  );
}
