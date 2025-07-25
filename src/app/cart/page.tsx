'use client'

import { useCart } from '@/hooks/useCart'
import CartItem from '@/components/cart/CartItem'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect } from 'react'

export default function CartPage() {
  const { cart } = useCart()

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <main
      className="max-w-6xl mx-auto py-16 px-4"
      aria-labelledby="cart-heading"
    >
      <h1
        id="cart-heading"
        className="text-3xl font-bold mb-8 text-center text-brand"
      >
        Mon panier
      </h1>

      {cart.length === 0 ? (
        <motion.p
          className="text-center text-gray-600 dark:text-gray-400 text-lg"
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Votre panier est vide.
        </motion.p>
      ) : (
        <>
          <ul role="list" className="space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-10 border-t pt-6 flex flex-col items-center gap-4">
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Total : <span className="font-bold">{formatPrice(totalPrice)}</span>
            </p>

            <Link
              href="/commande"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              aria-label="Passer au paiement"
            >
              Passer au paiement
            </Link>

            <Link
              href="/"
              className="text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="Continuer vos achats"
            >
              ← Continuer vos achats
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
