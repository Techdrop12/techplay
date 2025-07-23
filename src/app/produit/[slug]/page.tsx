import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import { ProductJsonLd } from '@/components/JsonLd/ProductJsonLd'
import { pageview } from '@/lib/analytics'
import type { Product } from '@/types/product'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return {}

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/produit/${product.slug}`,
      images: [{ url: product.image || '/placeholder.png', alt: product.title || 'Produit TechPlay' }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const product: Product | null = await getProductBySlug(params.slug)
  if (!product) notFound()

  if (typeof window !== 'undefined') {
    pageview(`/produit/${params.slug}`)
  }

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <ProductDetail product={product} />
        <div className="mt-8">
          <AddToCartButton product={{ ...product, quantity: 1 }} />
        </div>
        <div className="mt-12">
          <ReviewForm productId={product._id} />
        </div>
      </main>

      <ProductJsonLd product={product} />
    </>
  )
}
