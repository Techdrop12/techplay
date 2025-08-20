// src/app/produit/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import type { Product } from '@/types/product'
import { getLocale } from 'next-intl/server'

// Revalidation statique (30 min) — bon compromis SEO / fraicheur prix/stock
export const revalidate = 1800

type PageProps = { params: { slug: string } }

// Petite aide pour garantir des URLs absolues (utile pour OG/Twitter)
function absoluteUrl(path: string, base: string) {
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com'
  const locale = (await getLocale().catch(() => 'fr')) ?? 'fr'
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Produit introuvable – TechPlay',
      robots: { index: false, follow: true },
    }
  }

  const url = absoluteUrl(`/${locale}/produit/${product.slug}`, baseUrl)
  const absImage = absoluteUrl(product.image || '/placeholder.png', baseUrl)
  const title = `${product.title} | TechPlay`
  const description =
    (product.description && product.description.slice(0, 160)) ||
    'Découvrez ce produit TechPlay.'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: absoluteUrl(`/fr/produit/${product.slug}`, baseUrl),
        en: absoluteUrl(`/en/produit/${product.slug}`, baseUrl),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'TechPlay',
      // ❗️TypeScript n’accepte pas "product" ici → on reste sur "website"
      type: 'website',
      images: [
        {
          url: absImage,
          alt: product.title || 'Produit TechPlay',
          width: 1200,
          height: 630,
        },
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
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const locale = (await getLocale().catch(() => 'fr')) ?? 'fr'
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const safeProduct = product as Product

  // JSON-LD Product (SEO)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com'
  const productUrl = absoluteUrl(`/${locale}/produit/${safeProduct.slug}`, baseUrl)
  const imageUrl = absoluteUrl(safeProduct.image || '/placeholder.png', baseUrl)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: safeProduct.title,
    image: [imageUrl],
    description: safeProduct.description || undefined,
    sku: safeProduct._id || undefined,
    brand: {
      '@type': 'Brand',
      name: 'TechPlay',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: typeof safeProduct.price === 'number' ? safeProduct.price.toFixed(2) : undefined,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating:
      typeof safeProduct.rating === 'number'
        ? {
            '@type': 'AggregateRating',
            ratingValue: safeProduct.rating.toFixed(1),
            reviewCount: 12,
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
        item: absoluteUrl(`/${locale}`, baseUrl),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produits',
        item: absoluteUrl(`/${locale}/produit`, baseUrl),
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
