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

  const isEmpty = !cart || cart.length === 0

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
      aria-labelledby="checkout-title"
    >
      <h1
        id="checkout-title"
        className="text-4xl font-bold text-center mb-10 text-brand dark:text-brand-light"
      >
        Finaliser ma commande
      </h1>

      {isEmpty ? (
        <p
          className="text-center text-gray-600 dark:text-gray-400 text-lg"
          role="alert"
          aria-live="polite"
        >
          Votre panier est vide.
        </p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <CartList items={cart} />
          </div>

          <aside
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6 space-y-8 h-fit"
            aria-label="Résumé et paiement"
          >
            <CartSummary items={cart} />
            <CheckoutForm />
          </aside>
        </div>
      )}
    </main>
  )
}
