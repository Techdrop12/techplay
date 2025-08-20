'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Product } from '@/types/product'
import CartItem from '@/components/cart/CartItem'
import { useCart } from '@/hooks/useCart'

interface CartListProps {
  items: (Product & { quantity: number })[]
  /** Afficher un mini header (compteur + bouton “Vider”) */
  showControls?: boolean
  /** Callback clear custom (sinon utilise useCart().clearCart) */
  onClear?: () => void
  className?: string
}

export default function CartList({
  items,
  showControls = true,
  onClear,
  className = '',
}: CartListProps) {
  const prefersReducedMotion = useReducedMotion()
  const srRef = useRef<HTMLSpanElement | null>(null)
  const { clearCart } = useCart()

  const isEmpty = !items?.length
  const itemsCount = useMemo(
    () => (items || []).reduce((s, it) => s + Math.max(1, Number(it.quantity || 1)), 0),
    [items]
  )

  // Région live : annonce le nombre d’articles
  useEffect(() => {
    if (!srRef.current) return
    srRef.current.textContent =
      isEmpty
        ? 'Panier vide'
        : `${itemsCount} article${itemsCount > 1 ? 's' : ''} dans le panier`
  }, [isEmpty, itemsCount])

  if (isEmpty) {
    return (
      <motion.p
        className="text-center text-gray-600 dark:text-gray-400 text-sm"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        Aucun article dans le panier.
      </motion.p>
    )
  }

  const handleClear = () => {
    if (onClear) onClear()
    else {
      try {
        clearCart()
      } catch {
        // no-op
      }
    }
  }

  return (
    <section aria-label="Articles du panier" className={className}>
      {/* Live region (sr-only) */}
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" />

      {showControls && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {itemsCount} article{itemsCount > 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-semibold text-red-600 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
            aria-label="Vider le panier"
          >
            Vider le panier
          </button>
        </div>
      )}

      <ul role="list" className="space-y-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item._id ?? item.slug}
              role="listitem"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            >
              <CartItem
                item={{
                  _id: item._id,
                  slug: item.slug,
                  title: item.title ?? 'Produit',
                  image: item.image ?? '/placeholder.png',
                  price: item.price ?? 0,
                  quantity: Math.max(1, Number(item.quantity || 1)),
                }}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
