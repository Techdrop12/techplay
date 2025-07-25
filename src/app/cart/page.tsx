'use client'

import CartItem from '@/components/cart/CartItem'
import { useCart } from '@/hooks/useCart'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const { cart } = useCart()

  return (
    <section className="max-w-6xl mx-auto py-16 px-4" aria-label="Page panier">
      <h1 className="text-3xl font-bold mb-8 text-center text-brand">Mon panier</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg" role="alert" aria-live="polite">
          Votre panier est vide.
        </p>
      ) : (
        <ul role="list" className="space-y-6">
          <AnimatePresence>
            {cart.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
