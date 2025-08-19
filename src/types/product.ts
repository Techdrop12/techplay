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
