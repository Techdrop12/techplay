import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import type { Product } from '@/types/product'
import ProductDetail from '@/components/ProductDetail'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ProductJsonLd from '@/components/JsonLd/ProductJsonLd'

export const revalidate = 1800

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) return { title: 'Produit introuvable – TechPlay', robots: { index: false, follow: true } }

  return {
    title: `${product.title} | TechPlay`,
    description: product.description || 'Détail du produit TechPlay',
    alternates: { canonical: `${SITE}/products/${params.slug}` },
    openGraph: {
      title: product.title,
      description: product.description || '',
      type: 'website',
      url: `${SITE}/products/${params.slug}`,
      images: product.image
        ? [{ url: product.image, alt: product.title }]
        : [{ url: `${SITE}/placeholder.png`, alt: 'Produit TechPlay' }],
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) return notFound()

  const safeProduct = product as Product

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-10" aria-label={`Page produit : ${safeProduct.title}`}>
        <ProductDetail product={safeProduct} />
        <div className="mt-8">
          <AddToCartButton product={{ ...safeProduct, quantity: 1 }} />
        </div>
        <div className="mt-12">
          <ReviewForm productId={safeProduct._id} />
        </div>
      </main>

      <ProductJsonLd product={safeProduct} />
    </>
  )
}
