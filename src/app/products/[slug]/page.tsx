// src/app/products/[slug]/page.tsx — SEO/Perf+ (cached fetch, hreflang, robust OG)
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { getProductBySlug } from '@/lib/data'
import type { Product } from '@/types/product'
import ProductDetail from '@/components/ProductDetail'
import ProductJsonLd from '@/components/JsonLd/ProductJsonLd'
import { defaultLocale as DEFAULT_LOCALE, isLocale } from '@/i18n/config'
import { generateProductMeta, jsonLdBreadcrumbs } from '@/lib/seo'
import { getFallbackDescription } from '@/lib/meta'

export const revalidate = 1800

// Déduplication du fetch entre generateMetadata() et la page
const getProductCached = cache(async (slug: string) => getProductBySlug(slug))

/* ---------------------- Metadata dynamique ---------------------- */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductCached(params.slug)
  const path = `/products/${params.slug}`

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit demandé est introuvable.',
      robots: { index: false, follow: true },
    }
  }

  const title = product.title ?? 'Produit'
  const description = getFallbackDescription(
    {
      title: product.title,
      brand: (product as any).brand,
      description: (product as any).description,
      price: (product as any).price,
      currency: 'EUR',
    },
    { maxLen: 160 }
  )
  const image = (product as any).image ?? '/og-image.jpg'
  const noindex = (product as any)?.noindex === true

  const base = generateProductMeta({
    title,
    description,
    url: path,       // relatif : helper gère absolu + hreflang
    image,
  })

  return {
    ...base,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    // Tags additionnels OG "product:*" (non typés par Next, via 'other')
    other: {
      ...(typeof (product as any).price === 'number'
        ? {
            'product:price:amount': String((product as any).price),
            'product:price:currency': 'EUR',
          }
        : {}),
      ...(product && (product as any).brand ? { 'product:brand': String((product as any).brand) } : {}),
    },
  }
}

/* ------------------------------ Page ----------------------------- */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductCached(params.slug)
  if (!product) return notFound()

  const safeProduct = product as Product

  // Locale depuis le cookie (cohérent avec RootLayout)
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = isLocale(cookieLocale || '') ? (cookieLocale as string) : (DEFAULT_LOCALE as string)

  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: '/' },
    { name: 'Produits', url: '/products' },
    { name: safeProduct.title ?? 'Produit', url: `/products/${safeProduct.slug}` },
  ])

  return (
    <>
      <main
        className="max-w-6xl mx-auto px-4 py-10"
        aria-label={`Page produit : ${safeProduct.title ?? 'Produit'}`}
      >
        {/* On passe la locale au client pour cohérence (ex. StickyCartSummary) */}
        <ProductDetail product={safeProduct} locale={locale} />
      </main>

      {/* JSON-LD Produit (centralisé dans ce composant pour éviter tout doublon) */}
      <ProductJsonLd product={safeProduct} maxReviews={3} />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
    </>
  )
}
