'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export default function WishlistButton({ productId }) {
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setIsInWishlist(saved.includes(productId))
  }, [productId])

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    let updated

    if (saved.includes(productId)) {
      updated = saved.filter(id => id !== productId)
      setIsInWishlist(false)
    } else {
      updated = [...saved, productId]
      setIsInWishlist(true)
    }

    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  return (
    <button
      onClick={toggleWishlist}
      className={`flex items-center gap-1 text-sm ${isInWishlist ? 'text-red-500' : 'text-gray-500'}`}
    >
      <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
      {isInWishlist ? 'Retirer de la liste' : 'Ajouter à ma liste'}
    </button>
  )
}
