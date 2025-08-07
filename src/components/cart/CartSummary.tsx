// src/components/cart/CartSummary.tsx

import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

interface CartSummaryProps {
  items: (Product & { quantity: number })[]
}

export default function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + (item.price ?? 0) * item.quantity, 0)
  const total = subtotal // 🚧 future taxes / shipping to be added here

  return (
    <section
      className="space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700"
      role="region"
      aria-labelledby="cart-summary-title"
    >
      <h2
        id="cart-summary-title"
        className="text-xl font-bold text-gray-900 dark:text-white"
      >
        🧾 Résumé de la commande
      </h2>

      <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
        <span>Sous-total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {/* 🚚 Bonus : TVA, livraison, promo à venir ici */}

      <hr className="border-gray-300 dark:border-zinc-700" />

      <div className="flex justify-between items-center font-semibold text-lg text-brand">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </section>
  )
}
