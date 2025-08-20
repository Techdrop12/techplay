// src/app/produit/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import type { Product } from '@/types/product'
import { getLocale } from 'next-intl/server'

/** 👉 Force dynamique pour éviter tout échec au prerender */
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

function absoluteUrl(path: string, base: string) {
  try { return new URL(path, base).toString() } catch { return path }
}

async function safeGetLocale() {
  try { return (await getLocale()) || 'fr' } catch { return 'fr' }
}

async function safeGetProduct(slug: string): Promise<Product | null> {
  const s = String(slug || '').trim()
  if (!s) return null
  try {
    const p = await getProductBySlug(s)
    if (!p) return null
    // 💡 on s’assure que tout est sérialisable côté client
    const prod: Product = {
      ...(p as any),
      _id: String((p as any)?._id ?? ''),            // toString au cas où
      slug: String((p as any)?.slug ?? s),
      title: String((p as any)?.title ?? 'Produit'),
      description: typeof (p as any)?.description === 'string' ? (p as any).description : '',
      image: (p as any)?.image ? String((p as any).image) : '/placeholder.png',
      price: Number((p as any)?.price ?? 0),
    } as Product
    if (!prod.slug || !prod.title) return null
    return JSON.parse(JSON.stringify(prod)) // strip tout résidu non-sérialisable
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[product:getBySlug] failed for', slug, e)
    }
    return null
  }
}

/** ❌ On ne pré-génère plus les slugs (évite les erreurs de build) */
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const locale = await safeGetLocale()
  const product = await safeGetProduct(params.slug)

  if (!product) {
    return { title: 'Produit introuvable – TechPlay', robots: { index: false, follow: true } }
  }

  const url = absoluteUrl(`/${locale}/produit/${product.slug}`, baseUrl)
  const absImage = absoluteUrl(product.image || '/placeholder.png', baseUrl)
  const title = `${product.title} | TechPlay`
  const description = (product.description && product.description.slice(0, 160)) || 'Découvrez ce produit TechPlay.'

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
      title, description, url, siteName: 'TechPlay', type: 'website',
      images: [{ url: absImage, alt: product.title || 'Produit TechPlay', width: 1200, height: 630 }],
      locale,
    },
    twitter: { card: 'summary_large_image', title, description, images: [absImage] },
    robots: { index: true, follow: true },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const locale = await safeGetLocale()
  const product = await safeGetProduct(params.slug)
  if (!product) return notFound()

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const productUrl = absoluteUrl(`/${locale}/produit/${product.slug}`, baseUrl)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil',  item: absoluteUrl(`/${locale}`, baseUrl) },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: absoluteUrl(`/${locale}/produit`, baseUrl) },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
    ],
  }

  return (
    <main id="main" className="max-w-7xl mx-auto px-4 py-10" aria-label={`Page produit : ${product.title}`}>
      <ProductDetail product={product} locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  )
}
