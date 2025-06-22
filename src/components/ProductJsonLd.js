// ✅ src/components/JsonLd/ProductJsonLd.js
import React from 'react';
import Head from 'next/head';

const ProductJsonLd = ({ product, siteUrl, locale }) => {
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: [`${siteUrl}${product.image}`],
    description: product.description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'TechPlay',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/${locale}/produit/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.reviews?.length || 1,
        }
      : undefined,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
    </Head>
  );
};

export default ProductJsonLd;
