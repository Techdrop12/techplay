'use client'

export default function FreeShippingBadge({ price }) {
  const threshold = 50

  if (price < threshold) {
    const remaining = (threshold - price).toFixed(2)
    return (
      <p className="text-sm text-gray-600 mt-1">
        Plus que <strong>{remaining} €</strong> pour la livraison gratuite !
      </p>
    )
  }

  return (
    <p className="text-sm text-green-600 mt-1 font-semibold">
      ✅ Livraison gratuite !
    </p>
  )
}
