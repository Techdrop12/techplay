// src/components/WishlistButton.tsx — ultimate: ripple + shake-on-limit + sizes + safe-in-card
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { logEvent } from '@/lib/logEvent'
import { trackAddToWishlist } from '@/lib/ga'
import { cn } from '@/lib/utils'

interface WishlistProduct {
  _id: string
  slug: string
  title: string
  price: number
  image: string
}

interface WishlistButtonProps {
  product: WishlistProduct
  /** Position flottante (coin de carte) */
  floating?: boolean
  className?: string
  disabled?: boolean
  /** Empêche la propagation pour ne pas cliquer le parent (Link/Card) */
  stopPropagation?: boolean
  /** Taille de l’icône/bouton */
  size?: 'sm' | 'md' | 'lg'
  /** Affiche un libellé “Wishlist” à côté de l’icône (mode inline) */
  withLabel?: boolean
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
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: list }))
  } catch {}
}

export default function WishlistButton({
  product,
  floating = true,
  className,
  disabled = false,
  stopPropagation = true,
  size = 'md',
  withLabel = false,
}: WishlistButtonProps) {
  const prefersReduced = useReducedMotion()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [srMsg, setSrMsg] = useState('')
  const [rippler, setRippler] = useState(0) // pour relancer l’anim ripple
  const [shake, setShake] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

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
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) init() }
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

    try { navigator.vibrate?.(8) } catch {}

    const list = readWishlist()
    const existsIdx = list.findIndex((p) => p._id === product._id)

    if (existsIdx >= 0) {
      const next = list.filter((p) => p._id !== product._id)
      writeWishlist(next)
      setIsWishlisted(false)
      setSrMsg(`${product.title} retiré de la wishlist`)
      toast('💔 Retiré de la wishlist', { icon: '💔' })
      try { logEvent({ action: 'wishlist_remove', category: 'wishlist', label: `product_${product._id}`, value: 1 }) } catch {}
    } else {
      if (list.length >= WISHLIST_LIMIT) {
        // Limite atteinte -> shake + toast
        setShake(true)
        setTimeout(() => setShake(false), 420)
        toast.error('Limite de wishlist atteinte', { icon: '⚠️' })
        return
      }
      const next = [product, ...list.filter((p) => p._id !== product._id)].slice(0, WISHLIST_LIMIT)
      writeWishlist(next)
      setIsWishlisted(true)
      setSrMsg(`${product.title} ajouté à la wishlist`)
      toast('❤️ Ajouté à la wishlist', { icon: '❤️' })
      setRippler((k) => k + 1) // relance l’anim ripple
      try { logEvent({ action: 'wishlist_add', category: 'wishlist', label: `product_${product._id}`, value: 1 }) } catch {}
      try {
        trackAddToWishlist?.({
          currency: 'EUR',
          value: Number(product.price) || 0,
          items: [{ item_id: product._id, item_name: product.title, price: product.price, quantity: 1 }],
        })
      } catch {}
    }

    setTimeout(() => setSrMsg(''), 1800)
  }

  const dim = size === 'sm' ? 28 : size === 'lg' ? 40 : 32
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20

  const baseFloating =
    'absolute top-2 right-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-black'
  const baseInline =
    'inline-flex items-center justify-center rounded-full text-red-600 hover:text-red-700 transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]'

  return (
    <>
      {/* Live region a11y */}
      <span className="sr-only" role="status" aria-live="polite">
        {srMsg}
      </span>

      <motion.button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          if (stopPropagation) { e.preventDefault(); e.stopPropagation() }
          toggleWishlist()
        }}
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        animate={shake ? { x: [-3, 3, -2, 2, 0] } : undefined}
        transition={{ duration: 0.42 }}
        className={cn(
          floating ? baseFloating : baseInline,
          'relative transition-colors',
          className
        )}
        style={{ width: dim, height: dim }}
        aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
        aria-pressed={isWishlisted}
        disabled={!valid || disabled}
        title={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
        data-wishlisted={isWishlisted ? 'true' : 'false'}
      >
        {/* Ripple à l’ajout */}
        {!prefersReduced && isWishlisted && (
          <motion.span
            key={rippler}
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ scale: 0.6, opacity: 0.35 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'ease-out' }}
            style={{ boxShadow: '0 0 0 6px rgba(239,68,68,0.15)' }}
            aria-hidden
          />
        )}

        {/* Halo accent quand wishlisted */}
        {isWishlisted && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-glow-accent" />}

        <Heart
          size={iconSize}
          className={isWishlisted ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          aria-hidden="true"
        />

        {!floating && withLabel && (
          <span className="ml-2 text-sm font-medium">{isWishlisted ? 'Dans la wishlist' : 'Wishlist'}</span>
        )}
      </motion.button>
    </>
  )
}
