export interface Product {
  _id: string
  slug: string
  title?: string
  price: number
  oldPrice?: number
  image?: string
  rating?: number
  isNew?: boolean         // Badge "Nouveau"
  isBestSeller?: boolean  // Badge "Best Seller"
  category?: string
  description?: string
  tags?: string[]
  // Ajoute d’autres propriétés nécessaires ici
}

export interface Pack {
  _id: string                 // Ajouté pour correspondre au code
  slug: string
  title: string
  description: string
  price: number
  oldPrice?: number           // Optionnel, si utilisé dans PackDetails etc.
  rating?: number             // Optionnel, si utilisé dans PackDetails etc.
  tags?: string[]             // Optionnel, si utilisé dans PackDetails etc.
  image?: string
  // Ajoute d’autres propriétés nécessaires ici
}
