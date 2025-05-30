'use client'

import { useEffect, useState } from 'react'

const getPromoMessage = () => {
  const hour = new Date().getHours()

  if (hour >= 18 && hour <= 23) {
    return '🎁 Livraison gratuite ce soir jusqu’à minuit !'
  }

  const stockBased = [
    '🔥 Profitez des derniers stocks disponibles !',
    '🚚 Livraison express sur tous les produits tech !',
    '⭐ Offres limitées sur les best-sellers !',
  ]

  return stockBased[Math.floor(Math.random() * stockBased.length)]
}

export default function PromoBanner() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage(getPromoMessage())
  }, [])

  if (!message) return null

  return (
    <div className="w-full bg-yellow-400 text-black text-center py-2 text-sm font-semibold animate-pulse">
      {message}
    </div>
  )
}
