// src/app/produit/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import type { Product } from '@/types/product'
import { getLocale } from 'next-intl/server'

// Revalidation statique (30 min) — bon compromis SEO / fraîcheur
export const revalidate = 1800

type PageProps = { params: { slug: string } }

// URLs absolues sûres (tolérantes)
function toAbs(path: string, base: string) {
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const locale = (await getLocale().catch(() => 'fr')) ?? 'fr'

  const product = await getProductBySlug(params.slug).catch(() => null)
  if (!product) {
    return {
      title: 'Produit introuvable – TechPlay',
      robots: { index: false, follow: true },
    }
  }

  const title = `${product.title} | TechPlay`
  const description =
    (product.description?.replace(/\s+/g, ' ').trim().slice(0, 160)) ||
    'Découvrez ce produit TechPlay.'
  const url = toAbs(`/${locale}/produit/${product.slug}`, baseUrl)
  const absImage = toAbs(product.image || '/placeholder.png', baseUrl)

  // Keywords à partir des tags éventuels
  const keywords =
    Array.isArray((product as any).tags) && (product as any).tags.length
      ? (product as any).tags.map((t: any) => String(t)).slice(0, 12)
      : ['TechPlay', 'high-tech', 'accessoires', 'gaming', 'électronique']

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        fr: toAbs(`/fr/produit/${product.slug}`, baseUrl),
        en: toAbs(`/en/produit/${product.slug}`, baseUrl),
        'x-default': url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'TechPlay',
      // NOTE: `type: 'product'` n’est pas accepté par les types Next → on reste sur 'website'
      type: 'website',
      images: [
        { url: absImage, alt: product.title || 'Produit TechPlay', width: 1200, height: 630 },
      ],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absImage],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const locale = (await getLocale().catch(() => 'fr')) ?? 'fr'
  const product = await getProductBySlug(params.slug).catch(() => null)
  if (!product) notFound()

  const safeProduct = product as Product

  // JSON-LD Product (SEO) enrichi
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const productUrl = toAbs(`/${locale}/produit/${safeProduct.slug}`, baseUrl)
  const imageUrl = toAbs(safeProduct.image || '/placeholder.png', baseUrl)

  const availability =
    typeof (safeProduct as any).stock === 'number'
      ? ((safeProduct as any).stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock')
      : 'https://schema.org/InStock'

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: safeProduct.title,
    image: [imageUrl],
    description: safeProduct.description || undefined,
    sku: (safeProduct as any)._id || undefined,
    brand: safeProduct && (safeProduct as any).brand
      ? { '@type': 'Brand', name: String((safeProduct as any).brand) }
      : { '@type': 'Brand', name: 'TechPlay' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: typeof safeProduct.price === 'number' ? safeProduct.price.toFixed(2) : undefined,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'TechPlay' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'FR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'EUR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
      },
    },
    aggregateRating:
      typeof (safeProduct as any).rating === 'number'
        ? {
            '@type': 'AggregateRating',
            ratingValue: (safeProduct as any).rating.toFixed(1),
            reviewCount: 12, // remplace si tu as la vraie donnée
          }
        : undefined,
  }

  // JSON-LD Breadcrumb
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: toAbs(`/${locale}`, baseUrl),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produits',
        item: toAbs(`/${locale}/produit`, baseUrl),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: safeProduct.title,
        item: productUrl,
      },
    ],
  }

  return (
    <main
      id="main"
      className="max-w-7xl mx-auto px-4 py-10"
      aria-label={`Page produit : ${safeProduct.title}`}
    >
      <ProductDetail product={safeProduct} locale={locale} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  )
}
