// ✅ src/lib/metaFallback.js
/**
 * Génère une description SEO de secours à partir des données produit.
 * Utilisé dans <SEOHead /> si aucune description personnalisée n’est fournie.
 */

export function getFallbackDescription(product) {
  if (!product || typeof product !== 'object') {
    return 'TechPlay – Découvrez les meilleurs produits tech, gadgets et innovations. Livraison rapide, SAV premium.';
  }

  const { title, brand, description, price } = product;

  let fallback = `Découvrez ${title}`;
  if (brand) fallback += ` de la marque ${brand}`;
  if (price) fallback += ` à seulement ${price} €`;
  fallback += ' sur TechPlay. Livraison rapide et satisfaction garantie.';

  if (description && typeof description === 'string') {
    const cleanDesc = description.replace(/[\n\r]+/g, ' ').trim();
    const snippet = cleanDesc.length > 160 ? cleanDesc.substring(0, 160) + '...' : cleanDesc;
    fallback += ` ${snippet}`;
  }

  return fallback;
}
