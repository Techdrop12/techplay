'use client'

export default function LowStockWarning({ stock }) {
  if (stock > 10) return null

  return (
    <p className="text-red-600 text-sm font-semibold mt-2">
      ⚠️ Attention, stock faible ({stock} restants)
    </p>
  )
}
