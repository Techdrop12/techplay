// src/components/cart/CartList.tsx
'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('cart')
  const prefersReducedMotion = useReducedMotion()
  const srRef = useRef<HTMLSpanElement | null>(null)
  const prevCountRef = useRef<number>(0)
  const { clearCart } = useCart()

  const safeItems = useMemo(
    () =>
      (items || []).map((it, index) => ({
        _id: String(it._id ?? it.slug ?? `cart-item-${index}`),
        slug: it.slug ?? '',
        title: it.title ?? t('product_fallback'),
        image: it.image ?? '/placeholder.png',
        price: Number(it.price ?? 0),
        quantity: Math.max(1, Number(it.quantity || 1)),
      })),
    [items, t]
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

    if (isEmpty) text = t('sr_empty')
    else if (prev === 0) text = t('sr_count_in_cart', { count: itemsCount })
    else if (itemsCount > prev) {
      const diff = itemsCount - prev
      text = t('sr_added', { diff, count: itemsCount })
    } else if (itemsCount < prev) {
      const diff = prev - itemsCount
      text = t('sr_removed', { diff, count: itemsCount })
    } else {
      text = t('sr_count_in_cart', { count: itemsCount })
    }

    srRef.current.textContent = text
    prevCountRef.current = itemsCount
  }, [isEmpty, itemsCount, t])

  if (isEmpty) {
    return (
      <motion.p
        className="text-center text-token-text/70 text-sm"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {t('no_items')}
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
    <section aria-label={t('cart_items_aria')} className={className}>
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <div className="mb-4 flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
        <h2 className="text-base font-semibold tracking-tight text-[hsl(var(--text))]">
          {t('items_heading')}
        </h2>
        {showControls && (
          <button
            type="button"
            onClick={handleClear}
            disabled={itemsCount === 0}
            aria-disabled={itemsCount === 0}
            className="text-[13px] text-token-text/70 underline decoration-token-text/40 underline-offset-2 transition hover:text-red-600 hover:decoration-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            aria-label={t('clear_cart_aria')}
          >
            {t('clear_cart_aria')}
          </button>
        )}
      </div>

      <ul role="list" className="space-y-3">
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