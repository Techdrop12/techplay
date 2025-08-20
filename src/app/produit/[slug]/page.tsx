// src/app/produit/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getProductBySlug, getAllProductSlugs } from '@/lib/data'
import type { Product } from '@/types/product'
import { getLocale } from 'next-intl/server'

export const revalidate = 1800
export const dynamicParams = true

const ProductDetail = dynamic(() => import('@/components/ProductDetail'), {
  ssr: false,
  loading: () => (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded bg-gray-200/70 dark:bg-zinc-800" />
        <div className="h-64 w-full rounded bg-gray-200/70 dark:bg-zinc-800" />
      </div>
    </main>
  ),
})

function absoluteUrl(path: string, base: string) {
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}

async function safeGetLocale() {
  try {
    return (await getLocale()) || 'fr'
  } catch {
    return 'fr'
  }
}

function normalizeProduct(p: any, fallbackSlug: string): Product {
  const images = Array.isArray(p?.images) ? p.images.filter(Boolean) : []
  return {
    _id: String(p?._id ?? p?.id ?? p?.slug ?? fallbackSlug),
    slug: String(p?.slug ?? fallbackSlug),
    title: String(p?.title ?? 'Produit'),
    description: typeof p?.description === 'string' ? p.description : '',
    image: String(p?.image ?? '/placeholder.png'),
    images,
    price: Number(p?.price ?? 0),
    oldPrice: Number.isFinite(p?.oldPrice) ? Number(p.oldPrice) : undefined,
    rating: Number.isFinite(p?.rating) ? Number(p.rating) : undefined,
    reviewCount: Number.isFinite(p?.reviewCount) ? Number(p.reviewCount) : undefined,
    isNew: !!p?.isNew,
    isBestSeller: !!p?.isBestSeller,
    tags: Array.isArray(p?.tags) ? p.tags : [],
    stock: Number.isFinite(p?.stock) ? Number(p.stock) : undefined,
    brand: p?.brand,
    sku: p?.sku,
    gtin: p?.gtin,
    currency: String(p?.currency || 'EUR').toUpperCase(),
  } as Product
}

async function safeGetProduct(slug: string): Promise<Product | null> {
  const s = String(slug || '').trim()
  if (!s) return null
  try {
    const p = await getProductBySlug(s)
    if (!p) return null
    const prod = normalizeProduct(p, s)
    if (!prod.slug || !prod.title) return null
    return prod
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[product:getBySlug] failed for', slug, e)
    }
    return null
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs().catch(() => [])
    const uniq = Array.from(
      new Set((slugs || []).map((s: any) => String(s ?? '').trim()).filter(Boolean))
    )
    return uniq.slice(0, 5000).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const locale = await safeGetLocale()
  const product = await safeGetProduct(params.slug)

  if (!product) {
    return { title: 'Produit introuvable – TechPlay', robots: { index: false, follow: true } }
  }

  const url = absoluteUrl(`/${locale}/produit/${product.slug}`, baseUrl)
  const absImage = absoluteUrl(product.image || '/placeholder.png', baseUrl)
  const title = `${product.title} | TechPlay`
  const description =
    (product.description && product.description.slice(0, 160)) || 'Découvrez ce produit TechPlay.'

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
      type: 'website',
      images: [{ url: absImage, alt: product.title || 'Produit TechPlay', width: 1200, height: 630 }],
      locale,
    },
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
