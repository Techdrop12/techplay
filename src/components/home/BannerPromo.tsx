'use client'
import { useEffect, useState } from 'react'

export default function BannerPromo() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const closed = sessionStorage.getItem('promo_closed')
    if (closed) setShow(false)
  }, [])

  if (!show) return null

  return (
    <div className="bg-yellow-100 text-yellow-800 py-2 px-4 text-center text-sm">
      🚨 Offre spéciale : livraison gratuite dès 50 € –{" "}
      <button
        className="underline ml-2"
        onClick={() => {
          sessionStorage.setItem('promo_closed', 'true')
          setShow(false)
        }}
      >
        Fermer
      </button>
    </div>
  )
}
