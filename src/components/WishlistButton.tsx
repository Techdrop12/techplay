'use client'

import { useEffect, useState } from 'react'
import { Heart, HeartOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { logEvent } from '@/lib/logEvent'

interface WishlistProduct {
  _id: string
  slug: string
  title: string
  price: number
  image: string
}

interface WishlistButtonProps {
  product: WishlistProduct
  floating?: boolean
  className?: string
}

const STORAGE_KEY = 'wishlist'

export default function WishlistButton({
  product,
  floating = true,
  className = '',
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !product?._id) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || '[]'
      const wishlist: WishlistProduct[] = JSON.parse(stored)
      setIsWishlisted(wishlist.some((p) => p._id === product._id))
    } catch {
      setIsWishlisted(false)
    }

    const sync = () => {
      try {
        const updated = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        setIsWishlisted(updated.some((p: WishlistProduct) => p._id === product._id))
      } catch {
        setIsWishlisted(false)
      }
    }

    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [product._id])

  const toggleWishlist = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || '[]'
      let wishlist: WishlistProduct[] = JSON.parse(stored)

      if (isWishlisted) {
        wishlist = wishlist.filter((p) => p._id !== product._id)
        toast('💔 Retiré de la wishlist', { icon: '💔' })
        logEvent('wishlist_remove', { productId: product._id })
      } else {
        wishlist.unshift(product)
        wishlist = wishlist.slice(0, 20)
        toast('❤️ Ajouté à la wishlist', { icon: '❤️' })
        logEvent('wishlist_add', { productId: product._id })
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
      setIsWishlisted(!isWishlisted)
      window.dispatchEvent(new Event('storage'))
    } catch {
      toast.error('Erreur lors de la mise à jour de la wishlist')
    }
  }

  return (
    <motion.button
      onClick={toggleWishlist}
      whileTap={{ scale: 0.85 }}
      className={`${
        floating
          ? 'absolute top-2 right-2 p-1 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
          : 'text-red-600 hover:text-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-500'
      } ${className}`}
      aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      aria-pressed={isWishlisted}
      title={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      role="button"
      tabIndex={0}
      aria-live="polite"
    >
      {isWishlisted ? (
        <HeartOff size={20} className="text-red-500" fill="currentColor" stroke="currentColor" />
      ) : (
        <Heart size={20} className="text-gray-600" fill="none" stroke="currentColor" />
      )}
    </motion.button>
  )
}
