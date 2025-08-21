// src/components/AddToCartButton.tsx — fixed
'use client'

import type React from 'react'
import { useRef, useState, useId, useCallback, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'
import Button from '@/components/Button'
import { toast } from 'react-hot-toast'
import { motion, useReducedMotion } from 'framer-motion'
import { logEvent } from '@/lib/logEvent'
import { trackAddToCart } from '@/lib/ga'

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'>

interface Props {
  product: MinimalProduct & { quantity?: number }
  onAdd?: () => void
  onError?: (err: unknown) => void

  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline' | 'glass'
  withIcon?: boolean
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  stopPropagation?: boolean

  haptic?: boolean
  ripple?: boolean
  flyToCart?: boolean
  flyToCartSelector?: string
  scrollToStickyOnMobile?: boolean
  afterAddFocus?: 'none' | 'cart' | 'button'

  pendingText?: string
  successText?: string
  debounceMs?: number
  ariaLabel?: string

  disableDataLayer?: boolean
  gtmExtra?: Record<string, unknown>
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

/** ripple visuel sans CSS global (WAAPI) */
function spawnRipple(e: React.MouseEvent<HTMLElement>) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const size = Math.max(rect.width, rect.height)

  const span = document.createElement('span')
  span.style.position = 'absolute'
  span.style.left = `${x - size / 2}px`
  span.style.top = `${y - size / 2}px`
  span.style.width = `${size}px`
  span.style.height = `${size}px`
  span.style.borderRadius = '9999px'
  span.style.pointerEvents = 'none'
  span.style.background = 'rgba(255,255,255,0.35)'
  span.style.mixBlendMode = 'overlay'
  target.style.position ||= 'relative'
  target.appendChild(span)

  const anim = span.animate(
    [{ transform: 'scale(0.6)', opacity: 0.35 }, { transform: 'scale(1.3)', opacity: 0 }],
    { duration: 520, easing: 'ease-out' }
  )
  anim.onfinish = () => span.remove()
}

/** petite bille qui “vole” vers l’icône panier */
function flyTo(el: HTMLElement, target: HTMLElement, prefersReduced: boolean) {
  const dot = document.createElement('div')
  const { left, top, width, height } = el.getBoundingClientRect()
  const t = target.getBoundingClientRect()
  const startX = left + width / 2
  const startY = top + height / 2
  const endX = t.left + t.width / 2
  const endY = t.top + t.height / 2

  dot.style.position = 'fixed'
  dot.style.left = `${startX}px`
  dot.style.top = `${startY}px`
  dot.style.width = '10px'
  dot.style.height = '10px'
  dot.style.borderRadius = '9999px'
  dot.style.background = 'hsl(var(--accent))'
  dot.style.boxShadow = '0 0 0 6px rgba(37,99,235,0.15)'
  dot.style.zIndex = '999999'
  dot.style.pointerEvents = 'none'
  document.body.appendChild(dot)

  const duration = prefersReduced ? 200 : 650
  const curveX = startX + (endX - startX) * 0.6
  const curveY = Math.min(startY, endY) - 120

  const keyframes: Keyframe[] = [
    { transform: `translate(-50%,-50%) scale(1)`, opacity: 1, offset: 0 },
    { transform: `translate(${curveX - startX}px, ${curveY - startY}px) scale(0.9)`, opacity: 0.95, offset: 0.6 },
    { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.6)`, opacity: 0, offset: 1 },
  ]
  dot.animate(keyframes, { duration, easing: prefersReduced ? 'linear' : 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => dot.remove()
}

export default function AddToCartButton({
  product,
  onAdd,
  onError,

  size = 'md',
  variant = 'solid',
  withIcon = true,
  fullWidth = true,
  className,
  disabled = false,
  stopPropagation = false,

  haptic = true,
  ripple = true,
  flyToCart = true,
  flyToCartSelector = '[data-cart-icon], a[href="/commande"]',
  scrollToStickyOnMobile = true,
  afterAddFocus = 'none',

  pendingText = 'Ajout en cours…',
  successText = 'Produit ajouté au panier 🎉',
  debounceMs = 350,
  ariaLabel,

  disableDataLayer = false,
  gtmExtra,
}: Props) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [srMessage, setSrMessage] = useState('')
  const prefersReduced = useReducedMotion()
  const lastClickRef = useRef<number>(0)
  const labelId = useId()
  const wrapperRef = useRef<HTMLDivElement | null>(null) // <-- ref sur le wrapper (pas sur <Button>)

  const sizeClasses =
    size === 'sm'
      ? 'py-2 px-3 text-sm rounded-lg'
      : size === 'lg'
      ? 'py-5 px-6 text-lg rounded-2xl'
      : 'py-4 px-4 text-base rounded-xl'

  const variantClasses =
    variant === 'outline'
      ? 'bg-transparent text-[hsl(var(--accent))] border border-[hsl(var(--accent)/.4)] hover:bg-[hsl(var(--accent)/.08)]'
      : variant === 'glass'
      ? 'bg-white/15 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 dark:bg-zinc-900/30 dark:border-white/10'
      : 'bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent)/.90)]'

  const Spinner = () => (
    <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" fill="none" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
  const CartIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4M6.2 6l.63 3H20a1 1 0 0 1 .98 1.2l-1.2 6A2 2 0 0 1 17.83 16H9a2 2 0 0 1-1.96-1.6L5 4H3a1 1 0 0 1 0-2h2.72a1 1 0 0 1 .98.8L7 6z"
      />
    </svg>
  )

  const doDataLayerPush = useCallback(
    (detail: Record<string, unknown>) => {
      if (disableDataLayer) return
      try {
        ;(window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).dataLayer.push({
          event: 'add_to_cart',
          ecommerce: {
            currency: 'EUR',
            value: detail.value,
            items: [
              {
                item_id: detail.id,
                item_name: detail.title,
                price: detail.price,
                quantity: detail.quantity,
                item_variant: (detail as any).variant,
                item_brand: (detail as any).brand,
                item_category: (detail as any).category,
              },
            ],
          },
          ...gtmExtra,
        })
      } catch {}
    },
    [disableDataLayer, gtmExtra]
  )

  const focusCartIcon = () => {
    try {
      const target = document.querySelector<HTMLElement>(flyToCartSelector)
      target?.focus?.()
    } catch {}
  }

  const handleClick = useCallback(
    async (e?: React.MouseEvent) => {
      if (stopPropagation && e) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (loading || disabled) return

      const now = Date.now()
      if (now - (lastClickRef.current || 0) < Math.max(0, debounceMs)) return
      lastClickRef.current = now

      const id = String(product?._id || '')
      const slug = String(product?.slug || '')
      const title = (product?.title || 'Produit').toString()
      const image = product?.image || '/placeholder.png'
      const price = Number(product?.price) || 0
      const quantity = clamp(Math.trunc(Number(product?.quantity ?? 1)), 1, 99)

      if (!id) {
        const err = new Error("Produit invalide — impossible d'ajouter au panier")
        toast.error(err.message)
        onError?.(err)
        return
      }

      setLoading(true)

      try {
        // ajout direct (plus de condition toujours vraie)
        const result = addToCart({ _id: id, slug, title, image, price, quantity })
        await Promise.resolve(result)

        try {
          logEvent?.({ action: 'add_to_cart', category: 'ecommerce', label: title, value: price * quantity })
        } catch {}
        try {
          trackAddToCart?.({
            currency: 'EUR',
            value: price * quantity,
            items: [{ item_id: id, item_name: title, price, quantity }],
          })
        } catch {}
        doDataLayerPush({ id, title, price, quantity, value: price * quantity, slug })

        if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate?.(prefersReduced ? 10 : [8, 12, 8]) } catch {}
        }

        if (flyToCart && wrapperRef.current) {
          const target = document.querySelector(flyToCartSelector) as HTMLElement | null
          if (target) flyTo(wrapperRef.current, target, !!prefersReduced)
        }

        toast.success(successText, {
          duration: 2400,
          position: 'top-right',
          style: { borderRadius: '10px', background: '#111827', color: '#fff' },
          iconTheme: { primary: '#2563eb', secondary: '#fff' },
        })

        setSrMessage(`${title} ajouté au panier`)
        setAdded(true)

        if (scrollToStickyOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
          const sticky =
            document.querySelector('aside[role="region"][data-visible="true"]') ||
            document.querySelector('aside[role="region"]')
          sticky && sticky.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }

        try {
          window.dispatchEvent(new CustomEvent('cart-added', { detail: { id, title, price, quantity, slug } }))
        } catch {}

        if (afterAddFocus === 'cart') focusCartIcon()
        else if (afterAddFocus === 'button') (wrapperRef.current as HTMLElement | null)?.focus?.()

        onAdd?.()
      } catch (err) {
        toast.error("Impossible d'ajouter au panier. Réessayez.")
        onError?.(err)
      } finally {
        setTimeout(() => setLoading(false), 420)
        setTimeout(() => setSrMessage(''), 1800)
        setTimeout(() => setAdded(false), 1200)
      }
    },
    [
      stopPropagation,
      loading,
      disabled,
      debounceMs,
      product?._id,
      product?.slug,
      product?.title,
      product?.image,
      product?.price,
      product?.quantity,
      haptic,
      prefersReduced,
      flyToCart,
      flyToCartSelector,
      scrollToStickyOnMobile,
      successText,
      afterAddFocus,
      onAdd,
      onError,
      doDataLayerPush,
      addToCart,
    ]
  )

  useEffect(() => () => setSrMessage(''), [])

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {srMessage}
      </span>

      <motion.div
        ref={wrapperRef}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        className={fullWidth ? 'w-full' : undefined}
      >
        <Button
          onMouseDown={(e) => {
            if (ripple && !prefersReduced) spawnRipple(e)
          }}
          onClick={handleClick}
          aria-labelledby={labelId}
          aria-label={ariaLabel}
          aria-disabled={loading || disabled ? true : undefined}
          type="button"
          data-loading={loading ? 'true' : 'false'}
          aria-busy={loading ? 'true' : 'false'}
          className={[
            fullWidth ? 'w-full' : '',
            'font-extrabold shadow-lg transition-colors focus:outline-none focus-visible:ring-4 active:scale-95',
            'focus-visible:ring-[hsl(var(--accent)/.55)]',
            variantClasses,
            sizeClasses,
            (loading || disabled) ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer',
            added ? 'ring-4 ring-emerald-400/40' : '',
            className || '',
          ].join(' ')}
          disabled={loading || disabled}
          data-qty={product.quantity ?? 1}
          data-product-id={product._id}
          data-action="add-to-cart"
          data-price={product.price}
        >
          <span id={labelId} className="inline-flex items-center gap-2">
            {loading && <Spinner />}
            {!loading && withIcon && <CartIcon className="-ml-0.5" />}
            {loading ? pendingText : added ? 'Ajouté ✅' : 'Ajouter au panier'}
          </span>
        </Button>
      </motion.div>
    </>
  )
}
