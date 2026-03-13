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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10"
      role="main"
      aria-labelledby="cart-title"
    >
      <nav aria-label="Fil d’Ariane" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-gray-700 dark:text-gray-200">
            Panier
          </li>
        </ol>
      </nav>

      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <motion.h1
        id="cart-title"
        className="text-3xl font-extrabold text-gray-900 dark:text-white text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 6 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        Mon panier{count > 0 ? ` (${count})` : ''}
      </motion.h1>
      {!isEmpty && (
        <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
          Livraison offerte dès {formatPrice(UI.FREE_SHIPPING_THRESHOLD)} · Paiement sécurisé · Retours gratuits sous 30 jours
        </p>
      )}

      {isEmpty ? (
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyCart locale="fr" />
          <div className="mt-6 text-center">
            <Link
              href="/products"
              className="inline-block text-sm text-white bg-black hover:bg-gray-800 transition px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-offset-zinc-900"
            >
              Explorer les produits
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.section
          className="grid lg:grid-cols-3 gap-10"
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