'use client'

import { useEffect, useState } from 'react'
import { toggleWishlistItem, isInWishlist } from '@/lib/wishlist'
import { motion } from 'framer-motion'

export default function WishlistButton({ product }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isInWishlist(product._id))
  }, [product._id])

  const handleToggle = () => {
    toggleWishlistItem(product)
    setActive(!active)
  }

  return (
    <motion.button
      onClick={handleToggle}
      aria-label="Ajouter aux favoris"
      className={`text-xl transition ${active ? 'text-red-500' : 'text-gray-400'}`}
      whileTap={{ scale: 1.4 }}
      whileHover={{ scale: 1.1 }}
    >
      {active ? '❤️' : '🤍'}
    </motion.button>
  )
}
