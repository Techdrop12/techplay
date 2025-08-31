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

export const revalidate = 1800

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

// Déduplication du fetch entre generateMetadata() et la page
const getProductCached = cache(async (slug: string) => getProductBySlug(slug))

/** Rend une URL absolue à partir d'une relative. */
const abs = (u: string) => {
  try {
    return new URL(u).toString()
  } catch {
    return new URL(u.startsWith('/') ? u : `/${u}`, SITE).toString()
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductCached(params.slug)

  const canonical = `${SITE}/products/${params.slug}`

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit demandé est introuvable.',
      robots: { index: false, follow: true },
      alternates: {
        canonical,
        languages: {
          'fr-FR': `${SITE}/fr/products/${params.slug}`,
          'en-US': `${SITE}/en/products/${params.slug}`,
          'x-default': canonical,
        },
      },
    }
  }

  const title = product.title ?? 'Produit'
  const desc =
    (product.description || 'Découvrez ce produit TechPlay.').slice(0, 300)
  const img = abs(product.image || '/og-image.jpg')

  const noindex = (product as any)?.noindex === true

  return {
    title,
    description: desc,
    metadataBase: new URL(SITE),
    alternates: {
      canonical,
      languages: {
        'fr-FR': `${SITE}/fr/products/${params.slug}`,
        'en-US': `${SITE}/en/products/${params.slug}`,
        'x-default': canonical,
      },
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: desc,
      type: 'website', // Next n'accepte que 'website' | 'article'
      url: canonical,
      images: [{ url: img, width: 1200, height: 630, alt: product.title ?? 'Produit TechPlay' }],
      siteName: 'TechPlay',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [img],
    },
    // Tags additionnels OG "product:*" (non typés par Next, via 'other')
    other: {
      ...(typeof (product as any).price === 'number'
        ? {
            'product:price:amount': String((product as any).price),
            'product:price:currency': 'EUR',
          }
        : {}),
      ...(product?.brand ? { 'product:brand': String(product.brand) } : {}),
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductCached(params.slug)
  if (!product) return notFound()

  const safeProduct = product as Product

  // Locale depuis le cookie (cohérent avec RootLayout)
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = isLocale(cookieLocale || '') ? (cookieLocale as string) : (DEFAULT_LOCALE as string)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: `${SITE}/products` },
      { '@type': 'ListItem', position: 3, name: safeProduct.title ?? 'Produit', item: `${SITE}/products/${safeProduct.slug}` },
    ],
  }

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
      <ProductJsonLd product={safeProduct} />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  )
}
