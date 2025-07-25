import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ProductJsonLd from '@/components/JsonLd/ProductJsonLd'
import type { Product } from '@/types/product'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: { slug: string }
  locale: string
}

export async function generateMetadata({ params, locale }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Produit introuvable – TechPlay' }

  const t = await getTranslations({ locale, namespace: 'seo' })

  return {
    title: `${product.title} | TechPlay`,
    description: product.description || t('product_not_found_description'),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/produit/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.description || '',
      type: 'website', // ✅ corrigé ici
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/produit/${product.slug}`,
      images: [
        {
          url: product.image || '/placeholder.png',
          alt: product.title || 'Produit TechPlay',
        },
      ],
    },
  }
}

export default async function ProductPage({ params, locale }: Props) {
  const product = await getProductBySlug(params.slug)

  if (!product) return notFound()

  const safeProduct = product as Product

  return (
    <>
      <main
        className="max-w-6xl mx-auto px-4 py-10"
        aria-label={`Page produit : ${safeProduct.title}`}
      >
        <ProductDetail product={safeProduct} locale={locale} />
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
