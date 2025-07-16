import { formatPrice } from '@/lib/utils'

export default function OrderSummary({ total }: { total: number }) {
  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold mb-2">Total</h3>
      <p className="text-xl text-brand font-semibold">{formatPrice(total)}</p>
    </div>
  )
}
