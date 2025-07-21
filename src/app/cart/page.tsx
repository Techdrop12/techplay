'use client'

import { useState } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  return (
    <section className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Mon panier</h1>
      {items.length === 0 ? (
        <p className="text-gray-600">Votre panier est vide.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} – {item.price} € x {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
