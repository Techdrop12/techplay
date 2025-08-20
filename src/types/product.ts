// src/types/product.ts
export interface Product {
  _id: string
  slug: string
  title?: string

  price: number
  oldPrice?: number
  currency?: string          // ex: 'EUR' (fallback côté UI)

  image?: string
  images?: string[]          // galerie optionnelle

  rating?: number
  reviewCount?: number       // pour schema.org AggregateRating

  isNew?: boolean
  isBestSeller?: boolean

  category?: string
  description?: string
  tags?: string[]

  brand?: string             // ou remplace par: string | { name: string }
  sku?: string | number
  gtin?: string | number     // 8 / 12 / 13 / 14 (on choisira l’itemProp auto)

  stock?: number
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

export interface Pack {
  _id: string
  slug: string
  title: string
  description: string
  price: number
  oldPrice?: number
  rating?: number
  tags?: string[]
  image?: string
}
