// src/components/cart/CartList.tsx
'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'

import type { Product } from '@/types/product'

import CartItem from '@/components/cart/CartItem'
import { useCart } from '@/hooks/useCart'

type CartListItem = Product & {
  quantity: number
  _id?: string
  slug?: string
  title?: string
  image?: string
  price?: number
}

interface CartListProps {
  items: CartListItem[]
  showControls?: boolean
  onClear?: () => void | Promise<void>
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
  const prevCountRef = useRef<number>(0)
  const { clearCart } = useCart()

  const safeItems = useMemo(
    () =>
      (items || []).map((it, index) => ({
        _id: String(it._id ?? it.slug ?? `cart-item-${index}`),
        slug: it.slug ?? '',
        title: it.title ?? 'Produit',
        image: it.image ?? '/placeholder.png',
        price: Number(it.price ?? 0),
        quantity: Math.max(1, Number(it.quantity || 1)),
      })),
    [items]
  )

  const isEmpty = safeItems.length === 0

  const itemsCount = useMemo(
    () => safeItems.reduce((s, it) => s + it.quantity, 0),
    [safeItems]
  )

  useEffect(() => {
    if (!srRef.current) return

    const prev = prevCountRef.current
    let text: string

    if (isEmpty) text = 'Panier vide'
    else if (prev === 0) text = `${itemsCount} article${itemsCount > 1 ? 's' : ''} dans le panier`
    else if (itemsCount > prev) {
      const diff = itemsCount - prev
      text = `${diff} article${diff > 1 ? 's' : ''} ajouté${diff > 1 ? 's' : ''}. ${itemsCount} au total.`
    } else if (itemsCount < prev) {
      const diff = prev - itemsCount
      text = `${diff} article${diff > 1 ? 's' : ''} retiré${diff > 1 ? 's' : ''}. ${itemsCount} au total.`
    } else {
      text = `${itemsCount} article${itemsCount > 1 ? 's' : ''} dans le panier`
    }

    srRef.current.textContent = text
    prevCountRef.current = itemsCount
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

  const handleClear = async () => {
    if (onClear) {
      await Promise.resolve(onClear())
    } else {
      try {
        clearCart()
      } catch {}
    }
  }

  return (
    <section aria-label="Articles du panier" className={className}>
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" />

      {showControls && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-medium text-token-text/70">
            {itemsCount} article{itemsCount > 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={handleClear}
            disabled={itemsCount === 0}
            aria-disabled={itemsCount === 0}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20 dark:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Vider le panier"
          >
            Vider le panier
          </button>
        </div>
      )}

      <ul role="list" className="space-y-4">
        <AnimatePresence initial={false}>
          {safeItems.map((item) => (
            <motion.li
              key={item._id}
              role="listitem"
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            >
              <CartItem
                item={{
                  _id: item._id,
                  slug: item.slug,
                  title: item.title,
                  image: item.image,
                  price: item.price,
                  quantity: item.quantity,
                }}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}