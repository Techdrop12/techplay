import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import { ProductJsonLd } from '@/components/JsonLd/ProductJsonLd'
import type { Product } from '@/types/product'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/produit/${product.slug}`,
      images: [
        {
          url: product.image || '/placeholder.png',
          alt: product.title || 'Produit TechPlay',
        },
      ],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const safeProduct: Product = product as Product

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-10">
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
