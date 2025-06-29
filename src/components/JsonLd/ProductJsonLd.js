// src/components/JsonLd/ProductJsonLd.js
import Head from 'next/head';

export default function ProductJsonLd({ product, siteUrl, locale = 'fr' }) {
  if (
    !product ||
    typeof product !== 'object' ||
    !product.title ||
    !product.slug ||
    !siteUrl
  ) {
    return null;
  }

  const url = `${siteUrl}/${locale}/produit/${product.slug}`;
  const price = parseFloat(product.price || 0).toFixed(2);
  const stock = Number.isFinite(product.stock) ? product.stock : 10;

  const availability =
    stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const images = Array.isArray(product.image)
    ? product.image
        .filter(Boolean)
        .map((img) =>
          typeof img === 'string' && img.startsWith('http')
            ? img
            : `${siteUrl}${img}`
        )
    : [
        typeof product.image === 'string'
          ? product.image.startsWith('http')
            ? product.image
            : `${siteUrl}${product.image}`
          : `${siteUrl}/placeholder.jpg`,
      ];

  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: images,
    description: product.description || '',
    sku: product.sku || product._id || '',
    mpn: product._id || '',
    brand: {
      '@type': 'Brand',
      name: product.brand || 'TechPlay',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating:
      product.rating && Number.isFinite(product.rating)
        ? {
            '@type': 'AggregateRating',
            ratingValue: parseFloat(product.rating).toFixed(1),
            reviewCount:
              Number.isFinite(product.reviewCount) && product.reviewCount > 0
                ? product.reviewCount
                : product.reviews?.length || 1,
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
