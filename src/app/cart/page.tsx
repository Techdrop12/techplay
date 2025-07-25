'use client'

import CartItem from '@/components/cart/CartItem'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const { cart } = useCart()

  return (
    <section className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Mon panier</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Votre panier est vide.
        </p>
      ) : (
        <ul role="list" className="space-y-6">
          {cart.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </ul>
      )}
    </section>
  )
}
