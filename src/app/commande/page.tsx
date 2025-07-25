'use client'

import { useCart } from '@/hooks/useCart'
import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { useEffect } from 'react'

export default function CheckoutPage() {
  const { cart } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      aria-labelledby="checkout-heading"
    >
      <h1
        id="checkout-heading"
        className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-10"
      >
        Valider ma commande
      </h1>

      {cart.length === 0 ? (
        <p
          className="text-center text-gray-600 dark:text-gray-400 text-lg"
          role="alert"
          aria-live="polite"
        >
          Votre panier est vide.
        </p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <CartList items={cart} />
          </div>

          <aside className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-6 space-y-8 h-fit">
            <CartSummary items={cart} />
            <CheckoutForm />
          </aside>
        </div>
      )}
    </main>
  )
}
