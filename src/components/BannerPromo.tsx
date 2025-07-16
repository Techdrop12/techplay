'use client'

import { useEffect, useState } from 'react'

export default function BannerPromo() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('promoBannerDismissed')
    if (dismissed) setVisible(false)
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem('promoBannerDismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="bg-brand dark:bg-zinc-900 text-white px-4 py-2 text-center text-sm">
      Livraison offerte dès 50 € d’achat – Profitez-en maintenant !
      <button onClick={dismiss} className="ml-4 text-xs underline">
        Fermer
      </button>
    </div>
  )
}
