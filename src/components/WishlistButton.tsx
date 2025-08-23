// src/components/WishlistButton.tsx — ultimate (hook-based, no direct LS)
'use client'

import { useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { logEvent } from '@/lib/logEvent'
import { trackAddToWishlist } from '@/lib/ga'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/hooks/useWishlist'

interface WishlistProduct {
  _id?: string
  id?: string
  slug?: string
  title?: string
  price?: number
  image?: string
  [k: string]: any
}

interface WishlistButtonProps {
  product: WishlistProduct
  floating?: boolean
  className?: string
  disabled?: boolean
  stopPropagation?: boolean
  size?: 'sm' | 'md' | 'lg'
  withLabel?: boolean
}

const WISHLIST_LIMIT = Number.parseInt(process.env.NEXT_PUBLIC_WISHLIST_LIMIT ?? '50', 10)

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
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [rippler, setRippler] = useState(0)
  const [shake, setShake] = useState(false)

  const { has, add, remove, count } = useWishlist()

  const pid = useMemo(() => String(product?._id ?? product?.id ?? ''), [product])
  const valid = pid.length > 0
  const isWishlisted = valid ? has(pid) : false

  const dim = size === 'sm' ? 28 : size === 'lg' ? 40 : 32
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20

  const baseFloating =
    'absolute top-2 right-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-black'
  const baseInline =
    'inline-flex items-center justify-center rounded-full text-red-600 hover:text-red-700 transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]'

  const onToggle = () => {
    if (!valid || disabled) return
    try { navigator.vibrate?.(8) } catch {}

    if (isWishlisted) {
      remove(pid)
      toast('💔 Retiré de la wishlist', { icon: '💔' })
      try { logEvent({ action: 'wishlist_remove', category: 'wishlist', label: `product_${pid}`, value: 1 }) } catch {}
      return
    }

    if (count >= WISHLIST_LIMIT) {
      setShake(true); setTimeout(() => setShake(false), 420)
      toast.error('Limite de wishlist atteinte', { icon: '⚠️' })
      return
    }

    const canonical = { ...product, id: pid } // on garantit id pour le hook
    add(canonical as any)
    toast('❤️ Ajouté à la wishlist', { icon: '❤️' })
    setRippler((k) => k + 1)

    try {
      logEvent({ action: 'wishlist_add', category: 'wishlist', label: `product_${pid}`, value: 1 })
    } catch {}
    try {
      trackAddToWishlist?.({
        currency: 'EUR',
        value: Number(product?.price) || 0,
        items: [{ item_id: pid, item_name: String(product?.title ?? ''), price: Number(product?.price) || 0, quantity: 1 }],
      })
    } catch {}
  }

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {/* messages live gérés via toasts => rien ici pour éviter le spam */}
      </span>

      <motion.button
        ref={btnRef}
        type="button"
        onClick={(e) => { if (stopPropagation) { e.preventDefault(); e.stopPropagation() } onToggle() }}
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        animate={shake ? { x: [-3, 3, -2, 2, 0] } : undefined}
        transition={{ duration: 0.42 }}
        className={cn(floating ? baseFloating : baseInline, 'relative transition-colors', className)}
        style={{ width: dim, height: dim }}
        aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
        aria-pressed={isWishlisted}
        disabled={!valid || disabled}
        title={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
        data-wishlisted={isWishlisted ? 'true' : 'false'}
      >
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
