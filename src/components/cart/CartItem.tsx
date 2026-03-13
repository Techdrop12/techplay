// src/components/cart/CartItem.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
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
      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReduced ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="card group flex items-center gap-4 rounded-[var(--radius-2xl)] p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-card-hover)]"
      role="listitem"
      aria-label={`Produit dans le panier : ${item.title}`}
      data-id={item._id}
    >
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <Link
        href={`/products/${item.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
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

      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={`/products/${item.slug}`}
          className="block line-clamp-1 text-[14px] font-semibold text-[hsl(var(--text))] transition hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          {item.title}
        </Link>

        <p className="text-[12px] text-token-text/70">
          {formatPrice(item.price)} / unité
        </p>

        <div className="mt-1.5 inline-flex items-center gap-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-1.5 py-0.5">
          <button
            type="button"
            onClick={dec}
            disabled={item.quantity <= MIN_QTY}
            className="rounded-lg p-1.5 transition hover:bg-white/50 disabled:opacity-40 dark:hover:bg-white/10"
            aria-label={`Diminuer la quantité de ${item.title}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>

          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={qty}
            onChange={(e) => setQty(clamp(Number(e.target.value)))}
            onBlur={() => commitQty(qty)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            aria-label={`Quantité pour ${item.title}`}
            className="w-10 bg-transparent text-center text-sm font-medium outline-none tabular-nums"
          />

          <button
            type="button"
            onClick={inc}
            disabled={item.quantity >= MAX_QTY}
            className="rounded-lg p-1.5 transition hover:bg-white/50 disabled:opacity-40 dark:hover:bg-white/10"
            aria-label={`Augmenter la quantité de ${item.title}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <p
          className="text-base font-extrabold tabular-nums tracking-tight text-[hsl(var(--accent))]"
          aria-label={`Total pour ${item.title} : ${formatPrice(lineTotal)}`}
        >
          {formatPrice(lineTotal)}
        </p>

        <button
          type="button"
          onClick={handleRemove}
          className="rounded-xl p-2.5 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:hover:bg-red-900/25 dark:focus:ring-offset-[hsl(var(--surface))]"
          aria-label={`Supprimer ${item.title} du panier`}
          title={`Supprimer ${item.title}`}
        >
          <Trash2
            className="h-5 w-5 text-red-600 transition-transform group-hover:scale-110 dark:text-red-400"
            aria-hidden="true"
          />
        </button>
      </div>
    </motion.li>
  )
}