'use client'

import { useEffect, useMemo, useState } from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { logEvent } from '@/lib/logEvent'
import { trackAddToWishlist } from '@/lib/ga'

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
  disabled?: boolean
}

const STORAGE_KEY = 'wishlist'
const WISHLIST_LIMIT = Number(process.env.NEXT_PUBLIC_WISHLIST_LIMIT ?? 50)

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function readWishlist(): WishlistProduct[] {
  if (typeof window === 'undefined') return []
  return safeParse<WishlistProduct[]>(localStorage.getItem(STORAGE_KEY), [])
}

function writeWishlist(list: WishlistProduct[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    // broadcast aux autres onglets/composants
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: list }))
  } catch {
    // no-op si quota plein
  }
}

export default function WishlistButton({
  product,
  floating = true,
  className = '',
  disabled = false,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [srMsg, setSrMsg] = useState('')

  const valid = useMemo(
    () => !!product && typeof product._id === 'string' && product._id.length > 0,
    [product]
  )

  // Hydrate + sync inter-onglets
  useEffect(() => {
    if (!valid) return
    const init = () => {
      const list = readWishlist()
      setIsWishlisted(list.some((p) => p._id === product._id))
    }
    init()

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) init()
    }
    const onCustom = () => init()

    window.addEventListener('storage', onStorage)
    window.addEventListener('wishlist-updated', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('wishlist-updated', onCustom as EventListener)
    }
  }, [valid, product?._id])

  const toggleWishlist = () => {
    if (!valid || disabled) return

    const list = readWishlist()
    const exists = list.findIndex((p) => p._id === product._id) >= 0

    if (exists) {
      const next = list.filter((p) => p._id !== product._id)
      writeWishlist(next)
      setIsWishlisted(false)
      setSrMsg(`${product.title} retiré de la wishlist`)
      toast('💔 Retiré de la wishlist', { icon: '💔' })
      try {
        logEvent({ action: 'wishlist_remove', category: 'wishlist', label: `product_${product._id}`, value: 1 })
      } catch {}
    } else {
      // Ajout en tête + limite
      const next = [product, ...list.filter((p) => p._id !== product._id)].slice(0, WISHLIST_LIMIT)
      writeWishlist(next)
      setIsWishlisted(true)
      setSrMsg(`${product.title} ajouté à la wishlist`)
      toast('❤️ Ajouté à la wishlist', { icon: '❤️' })
      try {
        logEvent({ action: 'wishlist_add', category: 'wishlist', label: `product_${product._id}`, value: 1 })
      } catch {}
      try {
        trackAddToWishlist?.({
          currency: 'EUR',
          value: Number(product.price) || 0,
          items: [{ item_id: product._id, item_name: product.title, price: product.price, quantity: 1 }],
        })
      } catch {}
    }

    // Nettoie le message SR
    setTimeout(() => setSrMsg(''), 1800)
  }

  const baseFloating =
    'absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
  const baseInline =
    'inline-flex items-center justify-center p-2 rounded-full text-red-600 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500'

  return (
    <>
      {/* Live region a11y */}
      <span className="sr-only" role="status" aria-live="polite">
        {srMsg}
      </span>

      <motion.button
        type="button"
        onClick={toggleWishlist}
        whileTap={{ scale: 0.88 }}
        className={`${floating ? baseFloating : baseInline} ${className}`}
        aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
        aria-pressed={isWishlisted}
        disabled={!valid || disabled}
        title={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      >
        <Heart
          size={20}
          className={isWishlisted ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}
          // rempli si wishlisted
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      </motion.button>
    </>
  )
}
