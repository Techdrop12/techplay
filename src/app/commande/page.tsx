'use client'

import { useCart } from '@/hooks/useCart'
import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'

export default function CheckoutPage() {
  const { cart } = useCart()

  return (
    <main
      className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8"
      aria-labelledby="checkout-heading"
    >
      <div className="md:col-span-2">
        <h1
          id="checkout-heading"
          className="text-3xl font-bold mb-6 text-brand"
        >
          Valider ma commande
        </h1>

        {cart.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-lg" role="alert" aria-live="polite">
            Votre panier est vide.
          </p>
        ) : (
          <CartList items={cart} />
        )}
      </div>

      <aside className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm p-6 h-fit">
        <CartSummary items={cart} />
      </aside>
    </main>
  )
}
