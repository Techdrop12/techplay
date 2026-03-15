import type { Metadata } from 'next'

import ProductCatalogue from '@/components/ProductCatalogue'
import { getAllProducts } from '@/lib/data'
import {
  resolveSearchParams,
  normalizeProductsSearchParams,
  mapProductsSortToCatalogue,
  buildProductsPageMetaStrings,
  type ProductsCatalogueQuery,
} from '@/lib/products-catalogue-params'
import { generateMeta, absoluteUrl } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<ProductsCatalogueQuery> | ProductsCatalogueQuery
}): Promise<Metadata> {
  const sp = await resolveSearchParams(searchParams)
  const query = normalizeProductsSearchParams(sp)
  const { title, description } = buildProductsPageMetaStrings(query)
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
  searchParams?: Promise<ProductsCatalogueQuery> | ProductsCatalogueQuery
}) {
  const products = await getAllProducts()
  const sp = await resolveSearchParams(searchParams)
  const query = normalizeProductsSearchParams(sp)

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
            url: absoluteUrl('/products'),
          }),
        }}
      />
    </>
  )
}
