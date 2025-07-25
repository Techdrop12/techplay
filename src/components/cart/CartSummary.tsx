import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

interface CartSummaryProps {
  items: (Product & { quantity: number })[]
}

export default function CartSummary({ items }: CartSummaryProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Résumé de la commande
      </h2>

      <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
        <span>Sous-total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <hr className="border-gray-300 dark:border-zinc-700" />

      <div className="flex justify-between items-center font-semibold text-lg text-brand">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  )
}
