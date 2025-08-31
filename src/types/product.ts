// src/types/product.ts

/** Avis client unitaire (1..5, entier) */
export interface Review {
  _id: string
  productId?: string
  /** Note entière de 1 à 5 */
  rating: 1 | 2 | 3 | 4 | 5
  /** Corps de l'avis */
  comment: string
  /** Auteur affiché (pseudo/prénom) */
  author?: string
  /** Titre optionnel */
  title?: string
  /** ISO date */
  createdAt?: string | Date
}

/** Agrégation des avis */
export interface AggregateRating {
  /** Moyenne 0..5 (décimale) */
  average: number
  /** Total d’avis */
  total: number
  /** Répartition (comptes) 5→1 */
  breakdownCount?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>
}

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

  /** Moyenne des notes (0..5) */
  rating?: number
  /** Nombre d’avis (utilisé pour le JSON-LD/affichage) */
  reviewsCount?: number

  /** (optionnel) détails d'avis si chargés */
  reviews?: Review[]
  /** (optionnel) agrégation côté API si fournie */
  aggregateRating?: AggregateRating

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

/** Pack/bundle de plusieurs produits. */
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
