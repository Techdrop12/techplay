import { formatPrice } from '@/lib/utils'

export default function OrderSummary({ total }: { total: number }) {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total</h3>
      <p className="text-xl font-bold text-brand">{formatPrice(total)}</p>
    </div>
  )
}
