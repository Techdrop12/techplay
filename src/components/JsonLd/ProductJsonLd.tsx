'use client'

import Head from 'next/head'
import { Product } from '@/types/product'

interface Props {
  product: Product
}

export function ProductJsonLd({ product }: Props) {
  const {
    slug,
    title,
    description,
    price,
    image,
    category = 'Produit',
  } = product

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: title,
    image: [image || '/placeholder.png'],
    description,
    sku: slug,
    category,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/produit/${slug}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  )
}
