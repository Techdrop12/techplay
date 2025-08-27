// src/types/product.ts

/** Produit unitaire vendu à l'item */
export interface Product {
  _id: string
  slug: string

  title?: string
  description?: string

  /** Prix courant (déjà calculé côté back si promo active) */
  price: number
  /** Ancien prix si promo (sinon undefined) */
  oldPrice?: number

  /** Image principale */
  image?: string

  /** Galerie d’images (alias : certaines collections utilisent `gallery`) */
  images?: string[]
  /** Alias pour compat DB existante */
  gallery?: string[]

  rating?: number
  /** Nombre d’avis (utilisé pour le JSON-LD/affichage) */
  reviewsCount?: number

  isNew?: boolean
  isBestSeller?: boolean

  category?: string
  brand?: string
  sku?: string

  /** Stock disponible (<=0 = rupture) */
  stock?: number

  /** Promo brute telle que stockée côté DB (optionnelle) */
  promo?: {
    price?: number
    startDate?: string | Date
    endDate?: string | Date
  }

  /** Libre : specs/attributs techniques */
  attributes?: Record<string, string | number | boolean>
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
 */
export interface Pack {
  _id: string
  slug: string
  title: string
  description: string
  price: number
  oldPrice?: number
  compareAtPrice?: number
  rating?: number
  reviewsCount?: number
  tags?: string[]

  image?: string
  images?: string[]

  isNew?: boolean
  isBestSeller?: boolean
  stock?: number

  items?: Array<{
    _id?: string
    slug?: string
    title?: string
    image?: string
    price?: number
    quantity?: number
  }>
}
