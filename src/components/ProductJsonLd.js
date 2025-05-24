export default function ProductJsonLd({ product }) {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [product.image],
    "description": product.description,
    "sku": product._id,
    "offers": {
      "@type": "Offer",
      "url": `https://www.techplay.com/produit/${product.slug}`,
      "priceCurrency": "EUR",
      "price": product.price.toFixed(2),
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
