// ✅ src/components/JsonLd/ProductJsonLd.js

import Head from 'next/head';

export default function ProductJsonLd({ product }) {
  if (!product) return null;

  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.image,
    description: product.description,
    sku: product.sku,
    mpn: product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'TechPlay',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/produit/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        }
      : undefined,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
}
