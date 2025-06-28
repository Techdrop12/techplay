// ✅ /src/lib/metaFallback.js (fallback meta/SEO universel)
export function getFallbackDescription(product) {
  if (!product) return 'TechPlay – boutique high-tech, gadgets et innovations.';
  return `${product.title} – Découvrez ce produit high-tech sur TechPlay. Livraison rapide, prix malin.`;
}
