'use client'

import Head from 'next/head'
import type { Product } from '@/types/product'

type Props = {
  product: Product & {
    brand?: string
    rating?: number
    reviewCount?: number
    availability?: string // ex: 'https://schema.org/InStock'
    currency?: string
    image?: string | string[]
    _id?: string
  }
}

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const DEF_AVAIL = 'https://schema.org/InStock'

export default function ProductJsonLd({ product }: Props) {
  if (!product) return null

  const {
    _id,
    slug = '',
    title = 'Produit',
    description = 'Découvrez ce produit sur notre boutique.',
    price = 0,
    image,
    category = 'Produit',
    brand,
    rating,
    reviewCount,
    availability,
    currency = 'EUR',
  } = product

  const productUrl = new URL(`/produit/${slug}`, ORIGIN).toString()
  const sku = String(_id || slug || '')
  const images = Array.isArray(image) ? image : [image ?? '/placeholder.png']
  const priceNumber =
    typeof price === 'string' ? Number.parseFloat(price) || 0 : Number(price) || 0

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: title,
    description,
    image: images,
    category,
    sku,
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : null),
    ...(typeof rating === 'number' && typeof reviewCount === 'number'
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount,
          },
        }
      : null),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: priceNumber.toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      availability: availability || DEF_AVAIL,
    },
  }

  return (
    <Head>
      <script
        id={`jsonld-product-${slug}`}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  )
}
