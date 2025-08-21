// src/components/AddToCartButton.tsx
'use client'

import { useRef, useState, useId, useCallback } from 'react'
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
  /** Callback après ajout réussi (déjà tracké et toasté) */
  onAdd?: () => void
  /** Callback en cas d’échec (ex: réseau) */
  onError?: (err: unknown) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  /** Haptique mobile (vibration) — défaut true */
  haptic?: boolean
  /** Scroll au sticky-cart sur mobile — défaut true */
  scrollToStickyOnMobile?: boolean
  /** Texte pendant le pending (loading) */
  pendingText?: string
  /** Texte toast succès */
  successText?: string
  /** Délai anti double-clic (ms) — défaut 350ms */
  debounceMs?: number
  /** Désactive le push vers window.dataLayer (GTM) */
  disableDataLayer?: boolean
  /** Aria-label personnalisé (sinon label interne) */
  ariaLabel?: string
  /** Ajoute des métadonnées custom au push GTM */
  gtmExtra?: Record<string, unknown>
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export default function AddToCartButton({
  product,
  onAdd,
  onError,
  size = 'md',
  className,
  disabled = false,
  haptic = true,
  scrollToStickyOnMobile = true,
  pendingText = 'Ajout en cours…',
  successText = 'Produit ajouté au panier 🎉',
  debounceMs = 350,
  disableDataLayer = false,
  ariaLabel,
  gtmExtra,
}: Props) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [srMessage, setSrMessage] = useState('')
  const prefersReduced = useReducedMotion()
  const lastClickRef = useRef<number>(0)
  const labelId = useId()

  const sizeClasses =
    size === 'sm'
      ? 'py-2 px-3 text-sm'
      : size === 'lg'
      ? 'py-5 px-6 text-lg'
      : 'py-4 px-4 text-base'

  const doDataLayerPush = useCallback((detail: Record<string, unknown>) => {
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
  }, [disableDataLayer, gtmExtra])

  const handleClick = useCallback(async () => {
    if (loading || disabled) return

    // anti double-click
    const now = Date.now()
    if (now - (lastClickRef.current || 0) < Math.max(0, debounceMs)) return
    lastClickRef.current = now

    // garde-fous sur les données
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
      // 1) Ajout panier (support sync OU async)
      const result = addToCart({ _id: id, slug, title, image, price, quantity })
      await Promise.resolve(result)

      // 2) Tracking (tolérant)
      try {
        logEvent?.({
          action: 'add_to_cart',
          category: 'ecommerce',
          label: title,
          value: price * quantity,
        })
      } catch {}
      try {
        trackAddToCart?.({
          currency: 'EUR',
          value: price * quantity,
          items: [{ item_id: id, item_name: title, price, quantity }],
        })
      } catch {}
      doDataLayerPush({ id, title, price, quantity, value: price * quantity, slug })

      // 3) Haptique (mobile)
      if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(prefersReduced ? 10 : [8, 12, 8])
        } catch {}
      }

      // 4) Toast succès
      toast.success(successText, {
        duration: 2400,
        position: 'top-right',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#2563eb', secondary: '#fff' },
      })

      // 5) Live region + état visuel
      setSrMessage(`${title} ajouté au panier`)
      setAdded(true)

      // 6) Scroll sticky cart (mobile)
      if (scrollToStickyOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
        const sticky =
          document.querySelector('aside[role="region"][data-visible="true"]') ||
          document.querySelector('aside[role="region"]')
        sticky && sticky.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }

      // 7) Event custom (intégrations)
      try {
        window.dispatchEvent(new CustomEvent('cart-added', { detail: { id, title, price, quantity, slug } }))
      } catch {}

      onAdd?.()
    } catch (err) {
      toast.error("Impossible d'ajouter au panier. Réessayez.")
      onError?.(err)
    } finally {
      // petits délais pour laisser les feedbacks se jouer
      setTimeout(() => setLoading(false), 420)
      setTimeout(() => setSrMessage(''), 1800)
      setTimeout(() => setAdded(false), 1200)
    }
  }, [
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
    scrollToStickyOnMobile,
    successText,
    onAdd,
    onError,
    doDataLayerPush,
  ])

  return (
    <>
      {/* Région live pour lecteurs d’écran */}
      <span className="sr-only" role="status" aria-live="polite">
        {srMessage}
      </span>

      <motion.div whileTap={prefersReduced ? undefined : { scale: 0.96 }} className="w-full">
        <Button
          onClick={handleClick}
          aria-labelledby={labelId}
          aria-label={ariaLabel}
          aria-disabled={loading || disabled ? true : undefined}
          type="button"
          data-loading={loading ? 'true' : 'false'}
          aria-busy={loading ? 'true' : 'false'}
          className={[
            'w-full font-extrabold rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-4 active:scale-95',
            'bg-accent hover:bg-accent/90 text-white focus:ring-accent/60',
            sizeClasses,
            (loading || disabled) ? 'opacity-80 cursor-not-allowed' : '',
            added ? 'ring-4 ring-emerald-400/40' : '',
            className || '',
          ].join(' ')}
          disabled={loading || disabled}
          data-qty={product.quantity ?? 1}
          data-product-id={product._id}
          data-action="add-to-cart"
          data-price={product.price}
        >
          <span id={labelId}>
            {loading ? pendingText : added ? 'Ajouté ✅' : 'Ajouter au panier'}
          </span>
        </Button>
      </motion.div>
    </>
  )
}
