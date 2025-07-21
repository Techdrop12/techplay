// src/types/product.ts

export interface Product {
  _id: string
  slug: string
  name: string          // utilisé dans certains composants
  title?: string        // alias pour compatibilité UI
  image: string
  imageUrl?: string     // alias pour compatibilité avec ProductCard
  description?: string
  price: number
  oldPrice?: number
  rating?: number
  featured?: boolean
  tags?: string[]
  category?: string
}

// ✅ Version enrichie et unifiée
export interface Pack {
  _id: string
  slug: string
  title: string
  description: string
  image: string
  price: number
  oldPrice?: number
  rating?: number
  tags?: string[]
}
