'use client'
import Head from 'next/head'
import { useLocale } from 'next-intl'

export default function ProductJsonLd({ product }) {
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'fr'

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
    '@id': `https://techplay.fr/${locale}/produit/${slug}`,
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
      url: `https://techplay.fr/${locale}/produit/${slug}`,
    },
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  )
}
