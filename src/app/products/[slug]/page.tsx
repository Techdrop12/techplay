// src/app/products/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import type { Product } from '@/types/product'
import ProductDetail from '@/components/ProductDetail'
import ProductJsonLd from '@/components/JsonLd/ProductJsonLd'

export const revalidate = 1800

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit demandé est introuvable.',
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE}/products/${params.slug}` },
    }
  }

  const title = product.title ?? 'Produit'
  const desc = product.description || 'Découvrez ce produit TechPlay.'
  const url = `${SITE}/products/${params.slug}`
  const img = product.image || `${SITE}/placeholder.png`

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      type: 'website', // ← 'product' n'est pas accepté par Next Metadata
      url,
      images: [{ url: img, width: 1200, height: 630, alt: product.title ?? 'Produit TechPlay' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [img],
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) return notFound()

  const safeProduct = product as Product

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
      <main className="max-w-6xl mx-auto px-4 py-10" aria-label={`Page produit : ${safeProduct.title ?? 'Produit'}`}>
        <ProductDetail product={safeProduct} />
      </main>

      <ProductJsonLd product={safeProduct} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  )
}
