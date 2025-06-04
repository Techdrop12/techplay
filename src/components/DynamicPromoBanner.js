'use client'

import { useEffect, useState } from 'react'

export default function DynamicPromoBanner() {
  const [promo, setPromo] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const now = new Date()

      // Exemple de logic promo dynamique
      const promos = [
        {
          id: 'low-stock',
          condition: () => Number(window.localStorage.getItem('user_score')) >= 6,
          message: '🔥 Stock bientôt épuisé ! Commandez maintenant.',
        },
        {
          id: 'tech-week',
          condition: () => now.getMonth() === 10, // Novembre
          message: "💥 TechWeek : -20 % sur tout le site jusqu’à dimanche !",
        },
        {
          id: 'free-shipping',
          condition: () => now.getHours() >= 18,
          message: '🚚 Livraison gratuite pour toute commande passée avant minuit !',
        },
      ]

      const active = promos.find((p) => {
        try {
          return p.condition()
        } catch {
          return false
        }
      })

      if (active) setPromo(active)
    } catch (e) {
      console.warn('Erreur DynamicPromoBanner :', e)
    }
  }, [])

  if (!promo) return null

  return (
    <div className="bg-yellow-300 text-black py-2 px-4 text-center font-semibold text-sm shadow-md">
      {promo.message}
    </div>
  )
}
