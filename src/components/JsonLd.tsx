'use client'

import Head from 'next/head'

type ProductJsonLdProps = {
  product: {
    _id: string
    title: string
    description: string
    price: number
    image: string | string[]
    category?: string
    slug: string
    brand?: string
    rating?: number
    reviewCount?: number
    availability?: string
  }
}

export default function JsonLd({ product }: ProductJsonLdProps) {
  if (!product) return null

  const {
    _id,
    title,
    description,
    price,
    image,
    category,
    slug,
    brand = 'TechPlay',
    rating = 4.8,
    reviewCount = 128,
    availability = 'https://schema.org/InStock',
  } = product

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://techplay.fr/produit/${slug}`,
    name: title,
    description,
    image: Array.isArray(image) ? image : [image],
    category,
    sku: _id,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price,
      availability,
      url: `https://techplay.fr/produit/${slug}`,
    },
  }

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </Head>
  )
}
