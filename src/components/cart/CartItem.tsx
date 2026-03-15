// src/components/cart/CartItem.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import Link from '@/components/LocalizedLink'
import { useCart } from '@/hooks/useCart'
import { safeProductImageUrl } from '@/lib/safeProductImage'
import { formatPrice } from '@/lib/utils'

interface CartItemProps {
  item: {
    _id: string
    slug: string
    title: string
    image: string
    price: number
    quantity: number
  }
}

const MIN_QTY = 1
const MAX_QTY = 99

const clamp = (n: number) => Math.max(MIN_QTY, Math.min(MAX_QTY, Math.trunc(n || 0)))

export default function CartItem({ item }: CartItemProps) {
  const t = useTranslations('cart')
  const prefersReduced = useReducedMotion()
  const { removeFromCart, increment, decrement, updateQuantity } = useCart()

  const [qty, setQty] = useState<number>(item.quantity)
  const srRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    setQty(item.quantity)
  }, [item.quantity])

  const lineTotal = useMemo(() => item.price * item.quantity, [item.price, item.quantity])

  const announce = (message: string) => {
    if (srRef.current) {
      srRef.current.textContent = message
    }
  }

  const handleRemove = () => {
    removeFromCart(item._id)
    announce(`${item.title} retiré du panier`)
  }

  const commitQty = (n: number) => {
    const q = clamp(n)

    if (q !== item.quantity) {
      updateQuantity(item._id, q)
      announce(`Quantité de ${item.title} mise à ${q}`)
    }

    setQty(q)
  }

  const dec = () => {
    decrement(item._id, 1)
  }

  const inc = () => {
    increment(item._id, 1)
  }

  return (
    <motion.li
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="group flex items-center gap-4 rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 p-4 shadow-sm transition-all duration-200 hover:bg-[hsl(var(--surface))] hover:shadow-md sm:p-5"
      role="listitem"
      aria-label={`Produit dans le panier : ${item.title}`}
      data-id={item._id}
    >
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <Link
        href={`/products/${item.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        aria-label={`Voir la fiche produit de ${item.title}`}
      >
        <Image
          src={safeProductImageUrl(item.image)}
          alt={item.title || 'Image produit'}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-0.5">
        <Link
          href={`/products/${item.slug}`}
          className="block line-clamp-2 break-words text-[14px] font-semibold text-[hsl(var(--text))] transition hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          {item.title}
        </Link>
        <p className="text-[12px] text-token-text/60">{formatPrice(item.price)}/{t('unit_label')}</p>
        <div className="inline-flex items-center gap-0 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-0.5 py-1 sm:px-1 sm:py-0.5">
          <button
            type="button"
            onClick={dec}
            disabled={item.quantity <= MIN_QTY}
            className="touch-target rounded p-2 transition hover:bg-white/50 disabled:opacity-40 dark:hover:bg-white/10 sm:p-1"
            aria-label={`Diminuer la quantité de ${item.title}`}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={qty}
            onChange={(e) => setQty(clamp(Number(e.target.value)))}
            onBlur={() => commitQty(qty)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            aria-label={t('quantity_for_aria', { title: item.title })}
            className="w-8 bg-transparent text-center text-[13px] font-medium outline-none tabular-nums"
          />
          <button
            type="button"
            onClick={inc}
            disabled={item.quantity >= MAX_QTY}
            className="rounded p-1 transition hover:bg-white/50 disabled:opacity-40 dark:hover:bg-white/10"
            aria-label={t('quantity_increase_aria', { title: item.title })}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p
          className="text-base font-bold tabular-nums text-[hsl(var(--accent))]"
          aria-label={`Total pour ${item.title} : ${formatPrice(lineTotal)}`}
        >
          {formatPrice(lineTotal)}
        </p>
        <button
          type="button"
          onClick={handleRemove}
          className="touch-target rounded-lg p-2.5 text-token-text/60 transition hover:bg-red-100 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:hover:bg-red-900/25 dark:hover:text-red-400 sm:p-2"
          aria-label={t('remove_item_aria', { title: item.title })}
          title={t('remove_item_title', { title: item.title })}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.li>
  )
}