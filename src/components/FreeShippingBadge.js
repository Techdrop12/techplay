'use client'

export default function FreeShippingBadge({ price }) {
  const threshold = 49

  if (price < threshold) {
    const remaining = (threshold - price).toFixed(2)
    return (
      <p className="text-sm text-gray-600 mt-1 animate-pulse">
        Plus que <strong>{remaining} €</strong> pour la livraison gratuite !
      </p>
    )
  }

  return (
    <p className="text-sm text-green-600 mt-1 font-semibold animate-fadeIn">
      ✅ Livraison gratuite !
    </p>
  )
}
