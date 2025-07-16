import Head from 'next/head';

export default function ProductJsonLd({ product }) {
  if (!product) return null;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [product.image],
    "description": product.description,
    "sku": product._id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://www.techplay.fr/produit/${product.slug}`
    }
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
