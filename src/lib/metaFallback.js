// ✅ src/lib/metaFallback.js

/**
 * Génère une description SEO fallback à partir des données produit.
 * Utilisé lorsque overrideDescription est absent dans <SEOHead />.
 */
export function getFallbackDescription(product) {
  if (!product || typeof product !== 'object') return 'Découvrez nos meilleurs produits tech sur TechPlay.';

  const { title, brand, description, price } = product;

  let fallback = `Découvrez ${title}`;
  if (brand) fallback += ` de la marque ${brand}`;
  if (price) fallback += ` à seulement ${price} €`;
  fallback += ' sur TechPlay. Livraison rapide garantie.';

  if (description && description.length > 20) {
    fallback += ` ${description.substring(0, 160)}...`;
  }

  return fallback;
}
