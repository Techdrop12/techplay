// src/components/AddToCartButton.tsx
'use client'

import { useRef, useState, useId } from 'react'
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
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  /** Afficher un petit haptique sur mobile (par défaut true) */
  haptic?: boolean
  /** Tenter de scroller vers le sticky cart en mobile (par défaut true) */
  scrollToStickyOnMobile?: boolean
  /** Texte personnalisé */
  pendingText?: string
  successText?: string
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export default function AddToCartButton({
  product,
  onAdd,
  size = 'md',
  className,
  disabled = false,
  haptic = true,
  scrollToStickyOnMobile = true,
  pendingText = 'Ajout en cours…',
  successText = 'Produit ajouté au panier 🎉',
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

  const handleClick = () => {
    if (loading || disabled) return

    // anti double-click (300ms)
    const now = Date.now()
    if (now - (lastClickRef.current || 0) < 300) return
    lastClickRef.current = now

    // garde-fous sur les données
    const id = String(product?._id || '')
    const title = (product?.title || 'Produit').toString()
    const image = product?.image || '/placeholder.png'
    const price = Number(product?.price) || 0
    const quantity = clamp(Math.trunc(Number(product?.quantity ?? 1)), 1, 99)

    if (!id) {
      toast.error("Produit invalide — impossible d'ajouter au panier")
      return
    }

    setLoading(true)

    try {
      // 1) Contexte panier
      addToCart({ _id: id, slug: product.slug, title, image, price, quantity })

      // 2) Tracks (tolérants)
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

      // 3) Haptique léger (mobile)
      if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(prefersReduced ? 10 : [8, 12, 8])
        } catch {}
      }

      // 4) Toast de succès
      toast.success(successText, {
        duration: 2400,
        position: 'top-right',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#2563eb', secondary: '#fff' },
      })

      // 5) Live region + état visuel “ajouté”
      setSrMessage(`${title} ajouté au panier`)
      setAdded(true)

      // 6) Scroll vers sticky cart en mobile
      if (scrollToStickyOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
        const sticky =
          document.querySelector('aside[role="region"][data-visible="true"]') ||
          // fallback : tout aside “region” visible
          document.querySelector('aside[role="region"]')
        sticky && sticky.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }

      // 7) Event custom (intégrations)
      try {
        window.dispatchEvent(new CustomEvent('cart-added', { detail: { id, title, price, quantity } }))
      } catch {}

      onAdd?.()
    } finally {
      // petit délai pour laisser l'anim/feedback respirer
      setTimeout(() => setLoading(false), 420)
      setTimeout(() => setSrMessage(''), 1800)
      setTimeout(() => setAdded(false), 1200)
    }
  }

  return (
    <>
      {/* Région live pour a11y */}
      <span className="sr-only" role="status" aria-live="polite">
        {srMessage}
      </span>

      <motion.div whileTap={prefersReduced ? undefined : { scale: 0.96 }} className="w-full">
        <Button
          onClick={handleClick}
          aria-labelledby={labelId}
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
        >
          <span id={labelId}>
            {loading ? pendingText : added ? 'Ajouté ✅' : 'Ajouter au panier'}
          </span>
        </Button>
      </motion.div>
    </>
  )
}
