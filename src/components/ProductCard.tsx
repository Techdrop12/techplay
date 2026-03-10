// src/components/WishlistButton.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, Heart, HeartCrack } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useWishlist, type WishlistItemBase } from '@/hooks/useWishlist'
import { trackAddToWishlist } from '@/lib/ga'
import { logEvent } from '@/lib/logEvent'
import { cn } from '@/lib/utils'

interface WishlistProduct {
  _id?: string
  id?: string
  slug?: string
  title?: string
  price?: number
  image?: string
  [k: string]: unknown
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

function toCanonicalWishlistProduct(product: WishlistProduct): (WishlistItemBase & WishlistProduct) | null {
  const id = String(product?._id ?? product?.id ?? '').trim()
  if (!id) return null
  return { ...product, id }
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
  const tBtn = useTranslations('buttons')
  const tToast = useTranslations('toasts')
  const tWL = useTranslations('wishlist')

  const prefersReduced = useReducedMotion()
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [rippler, setRippler] = useState(0)
  const [shake, setShake] = useState(false)
  const [sr, setSr] = useState('')

  const { has, add, remove, count } = useWishlist<WishlistItemBase & WishlistProduct>()

  const canonical = useMemo(() => toCanonicalWishlistProduct(product), [product])
  const pid = canonical?.id ?? ''
  const valid = pid.length > 0
  const isWishlisted = valid ? has(pid) : false

  const dim = size === 'sm' ? 28 : size === 'lg' ? 40 : 32
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20

  const baseFloating =
    'absolute top-2 right-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-black'

  const baseInline =
    'inline-flex items-center justify-center rounded-full text-red-600 hover:text-red-700 transition ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent))]'

  useEffect(() => {
    if (!sr) return
    const id = window.setTimeout(() => setSr(''), 1600)
    return () => window.clearTimeout(id)
  }, [sr])

  const onToggle = () => {
    if (!valid || disabled || !canonical) return

    try {
      navigator.vibrate?.(8)
    } catch {}

    const title = String(canonical.title ?? 'Product')
    const price = Number(canonical.price) || 0

    if (isWishlisted) {
      remove(pid)
      setSr(tWL('removed'))
      toast(tToast('removed_from_wishlist'), {
        icon: <HeartCrack size={18} className="text-gray-600" />,
        style: { borderRadius: '10px', background: '#111827', color: '#fff' },
      })
      try {
        logEvent({ action: 'wishlist_remove', category: 'wishlist', label: `product_${pid}`, value: 1 })
      } catch {}
      return
    }

    if (count >= WISHLIST_LIMIT) {
      setShake(true)
      setTimeout(() => setShake(false), 420)
      setSr(tWL('limit_reached'))
      toast.error(tWL('limit_reached'), {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
      })
      return
    }

    add(canonical)
    setSr(tWL('added'))
    toast.success(tToast('added_to_wishlist'), {
      icon: <Heart size={18} className="text-red-500" />,
      style: { borderRadius: '10px', background: '#111827', color: '#fff' },
    })
    setRippler((k) => k + 1)

    try {
      logEvent({ action: 'wishlist_add', category: 'wishlist', label: `product_${pid}`, value: 1 })
    } catch {}

    try {
      trackAddToWishlist({
        currency: 'EUR',
        value: price,
        items: [{ item_id: pid, item_name: title, price, quantity: 1 }],
      })
    } catch {}
  }

  const ariaLabel = isWishlisted ? tBtn('remove_from_wishlist') : tBtn('add_to_wishlist')

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {sr}
      </span>

      <motion.button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          if (stopPropagation) {
            e.preventDefault()
            e.stopPropagation()
          }
          onToggle()
        }}
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        animate={shake ? { x: [-3, 3, -2, 2, 0] } : undefined}
        transition={{ duration: 0.42 }}
        className={cn(floating ? baseFloating : baseInline, 'relative transition-colors', className)}
        style={{ width: dim, height: dim }}
        aria-label={ariaLabel}
        aria-pressed={isWishlisted}
        disabled={!valid || disabled}
        title={ariaLabel}
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

        {isWishlisted && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full shadow-glow-accent"
          />
        )}

        <Heart
          size={iconSize}
          className={isWishlisted ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          aria-hidden="true"
        />

        {!floating && withLabel && (
          <span className="ml-2 text-sm font-medium">
            {isWishlisted ? tWL('title') : 'Wishlist'}
          </span>
        )}
      </motion.button>
    </>
  )
}