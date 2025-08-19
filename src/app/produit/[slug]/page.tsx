import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import type { Product } from '@/types/product'
import { getLocale } from 'next-intl/server'

// Revalidation statique (30 min) — bon compromis SEO / fraicheur prix/stock
export const revalidate = 1800

type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
  const locale = (await getLocale().catch(() => 'fr')) ?? 'fr'
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Produit introuvable – TechPlay',
      robots: { index: false, follow: true },
    }
  }

  const url = `${baseUrl}/${locale}/produit/${product.slug}`
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
        fr: `${baseUrl}/fr/produit/${product.slug}`,
        en: `${baseUrl}/en/produit/${product.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'TechPlay',
      type: 'website',
      images: [
        {
          url: product.image || '/placeholder.png',
          alt: product.title || 'Produit TechPlay',
        },
      ],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

  return (
    <main
      id="main"
      className="max-w-7xl mx-auto px-4 py-10"
      aria-label={`Page produit : ${safeProduct.title}`}
    >
      <ProductDetail product={safeProduct} locale={locale} />
    </main>
  )
}
