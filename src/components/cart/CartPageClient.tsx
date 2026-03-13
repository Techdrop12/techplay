// src/components/cart/CartPageClient.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'

import type { Product } from '@/types/product'

import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'
import EmptyCart from '@/components/cart/EmptyCart'
import Link from '@/components/LocalizedLink'
import { useCart } from '@/hooks/useCart'
import { UI } from '@/lib/constants'
import { event as gaEvent, mapProductToGaItem, trackViewCart } from '@/lib/ga'
import { formatPrice } from '@/lib/utils'

type CartProduct = Product & { quantity: number }

export default function CartPageClient() {
  const { cart } = useCart()
  const prefersReduced = useReducedMotion()
  const srRef = useRef<HTMLParagraphElement | null>(null)

  const safeCart = useMemo<CartProduct[]>(() => {
    return Array.isArray(cart) ? (cart as CartProduct[]) : []
  }, [cart])

  const isEmpty = safeCart.length === 0

  const count = useMemo(
    () => safeCart.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [safeCart]
  )

  const cartTotal = useMemo(
    () => safeCart.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0),
    [safeCart]
  )

  const prevCountRef = useRef<number>(0)

  useEffect(() => {
    if (!srRef.current) return

    const prev = prevCountRef.current
    let text = ''

    if (count === 0) text = 'Panier vide'
    else if (prev === 0) text = `${count} article${count > 1 ? 's' : ''} dans le panier`
    else if (count > prev) {
      const diff = count - prev
      text = `${diff} article${diff > 1 ? 's' : ''} ajouté${diff > 1 ? 's' : ''}. ${count} au total.`
    } else if (count < prev) {
      const diff = prev - count
      text = `${diff} article${diff > 1 ? 's' : ''} retiré${diff > 1 ? 's' : ''}. ${count} au total.`
    } else {
      text = `${count} article${count > 1 ? 's' : ''} dans le panier`
    }

    srRef.current.textContent = text
    prevCountRef.current = count
  }, [count])

  useEffect(() => {
    if (isEmpty) return
    try {
      const value = Math.round(cartTotal * 100) / 100
      gaEvent?.({
        action: 'view_cart',
        category: 'ecommerce',
        label: 'cart_page',
        value,
      })
      const items = safeCart.map((p) => ({
        ...mapProductToGaItem(p),
        quantity: Number(p.quantity) || 1,
      }))
      trackViewCart({ currency: 'EUR', value, items })
    } catch {}
  }, [isEmpty, cartTotal, safeCart])

  return (
    <main
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      role="main"
      aria-labelledby="cart-title"
    >
      <nav aria-label="Fil d’Ariane" className="mb-6 text-[13px] text-token-text/60">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true" className="text-token-text/40">/</li>
          <li aria-current="page" className="font-medium text-token-text">
            Panier
          </li>
        </ol>
      </nav>

      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <motion.h1
        id="cart-title"
        className="text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        initial={prefersReduced ? false : { opacity: 0, y: 6 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        Mon panier{count > 0 ? ` (${count})` : ''}
      </motion.h1>
      {!isEmpty && (
        <p className="mt-2 text-center text-[13px] text-gray-600 dark:text-gray-400">
          Livraison offerte dès {formatPrice(UI.FREE_SHIPPING_THRESHOLD)} · Paiement sécurisé · Retours gratuits sous 30 jours
        </p>
      )}

      {isEmpty ? (
        <motion.div
          className="mt-8"
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyCart locale="fr" />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.4)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
            >
              Explorer les produits
            </Link>
            <Link
              href="/products/packs"
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-2.5 text-sm font-medium text-token-text transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              Voir les packs
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.section
          className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-12"
          aria-label="Contenu du panier"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={prefersReduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="lg:col-span-2">
            <CartList items={safeCart} />
          </div>
          <CartSummary items={safeCart} />
        </motion.section>
      )}
    </main>
  )
}