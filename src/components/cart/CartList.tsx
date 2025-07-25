'use client'

import CartItem from '@/components/cart/CartItem'
import type { Product } from '@/types/product'

interface CartListProps {
  items: (Product & { quantity: number })[]
}

export default function CartList({ items }: CartListProps) {
  if (!items?.length) return null

  return (
    <ul
      role="list"
      aria-label="Liste des articles du panier"
      className="space-y-4"
    >
      {items.map((item) => (
        <CartItem
          key={item._id || item.slug}
          item={{
            _id: item._id,
            slug: item.slug,
            title: item.title ?? 'Produit',
            image: item.image ?? '/placeholder.png',
            price: item.price ?? 0,
            quantity: item.quantity,
          }}
        />
      ))}
    </ul>
  )
}
