// ✅ /src/components/ProductJsonLd.js (SEO produit structuré)
import Head from 'next/head';

export default function ProductJsonLd({ product }) {
  if (!product) return null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            image: [product.image],
            description: product.description,
            sku: product.sku,
            brand: {
              '@type': 'Thing',
              name: 'TechPlay'
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: product.price,
              availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
              url: product.url || '',
            }
          }),
        }}
      />
    </Head>
  );
}
