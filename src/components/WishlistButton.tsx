'use client'

import { useEffect, useState } from 'react'

export default function WishlistButton({ productId }: { productId: string }) {
  const [isWished, setIsWished] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('wishlist') || '[]'
    const parsed = JSON.parse(stored)
    setIsWished(parsed.includes(productId))
  }, [productId])

  const toggle = () => {
    const stored = localStorage.getItem('wishlist') || '[]'
    const parsed = JSON.parse(stored)
    const updated = isWished ? parsed.filter((id: string) => id !== productId) : [...parsed, productId]
    localStorage.setItem('wishlist', JSON.stringify(updated))
    setIsWished(!isWished)
  }

  return (
    <button onClick={toggle} className="text-sm underline text-blue-600 dark:text-blue-400">
      {isWished ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
    </button>
  )
}
