'use client'

import { useCart } from '@/hooks/useCart'
import type { Metadata } from 'next'
import CartList from '@/components/cart/CartList'
import StickyCartSummary from '@/components/StickyCartSummary'

export const metadata: Metadata = {
  title: 'Mon panier – TechPlay',
  description: 'Consultez les produits de votre panier avant de passer commande.',
}

export default function CartPage() {
  const { cart } = useCart()

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10"
      role="main"
      aria-labelledby="page-title"
    >
      <h1
        id="page-title"
        className="text-3xl font-extrabold text-gray-900 dark:text-white text-center"
      >
        Mon panier
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
          <div className="lg:col-span-2">
            <CartList items={cart} />
          </div>
          <StickyCartSummary />
        </div>
      )}
    </main>
  )
}
