'use client'

export default function UrgencyBanner({ stock }) {
  if (stock > 5) return null
  return (
    <div className="bg-red-600 text-white text-center py-2 text-sm">
      🚨 Plus que {stock} exemplaire{stock > 1 ? 's' : ''} en stock !
    </div>
  )
}
