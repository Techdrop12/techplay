// ✅ src/lib/metaFallback.js

export function getFallbackDescription(product) {
  if (!product) return 'TechPlay – Boutique tech & accessoires tendances.';
  return `Découvrez ${product.title} au meilleur prix sur TechPlay. Livraison rapide, service client premium et paiement sécurisé.`;
}
