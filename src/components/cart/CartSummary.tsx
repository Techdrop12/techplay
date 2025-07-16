import { formatPrice } from '@/lib/utils'

export default function CartSummary({ items }: { items: any[] }) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold text-lg mb-2">Résumé de commande</h3>
      <p className="text-brand font-bold text-xl">{formatPrice(total)}</p>
    </div>
  )
}
