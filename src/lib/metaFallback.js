export function getFallbackDescription(product) {
  return product?.description?.slice(0, 160) || 'Découvrez nos produits tech de qualité chez TechPlay.'
}
