// src/types/product.ts

/** Produit unitaire vendu à l'item */
export interface Product {
  _id: string
  slug: string
  title?: string
  price: number
  oldPrice?: number
  image?: string
  images?: string[]          // galerie optionnelle
  rating?: number
  isNew?: boolean
  isBestSeller?: boolean
  category?: string
  description?: string
  tags?: string[]
  brand?: string
  sku?: string
  stock?: number             // quantité disponible (<=0 = rupture)
}

// Pour le panier (réutilisé partout)
export type CartItem = {
  _id: string
  slug: string
  title?: string
  price: number
  image?: string
  quantity: number
}

/**
 * Pack/bundle de plusieurs produits.
 * On ajoute des champs optionnels utilisés par l’UI pour les badges,
 * remises et états (type-safe et rétrocompatible).
 */
export interface Pack {
  _id: string
  slug: string
  title: string
  description: string
  price: number
  oldPrice?: number          // ancien prix (peut servir de prix de référence)
  /** Prix de référence alternatif (compare-at), si différent d’oldPrice */
  compareAtPrice?: number
  rating?: number
  tags?: string[]

  // Média
  image?: string
  images?: string[]          // galerie optionnelle (cover = images[0] si présent)

  // Badges/états d’affichage
  isNew?: boolean
  isBestSeller?: boolean
  stock?: number             // quantité disponible pour le pack

  /**
   * Items contenus dans le pack (si exposés) — structure souple.
   * Tu peux affiner plus tard si tu as un modèle précis.
   */
  items?: Array<{
    _id?: string
    slug?: string
    title?: string
    image?: string
    price?: number
    quantity?: number
  }>
}
