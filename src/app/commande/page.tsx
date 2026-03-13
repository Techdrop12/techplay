'use client'

import { useEffect, useMemo, useRef } from 'react'

import type { Product } from '@/types/product'

import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import Link from '@/components/LocalizedLink'
import { useCart } from '@/hooks/useCart'
import { detectCurrency } from '@/lib/currency'
import { mapProductToGaItem, pushDataLayer, trackBeginCheckout } from '@/lib/ga'

type CheckoutItem = Product & { quantity: number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(record: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return undefined
}

function readNumber(record: Record<string, unknown>, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key]
    const parsed =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : NaN

    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function normalizeCartItem(value: unknown): CheckoutItem | null {
  if (!isRecord(value)) return null

  const slug = readString(value, ['slug']) ?? readString(value, ['_id', 'id'])
  const id = readString(value, ['_id', 'id', 'slug']) ?? slug
  const price = readNumber(value, ['price'])
  const quantity = Math.max(1, readNumber(value, ['quantity', 'qty']) ?? 1)

  if (!slug || !id || typeof price !== 'number') return null

  return {
    _id: id,
    slug,
    price,
    quantity,
    title: readString(value, ['title', 'name']),
    image: readString(value, ['image']),
    description: readString(value, ['description']),
    category: readString(value, ['category']),
    brand: readString(value, ['brand']),
    sku: readString(value, ['sku']),
    stock: readNumber(value, ['stock']),
    rating: readNumber(value, ['rating']),
    reviewsCount: readNumber(value, ['reviewsCount']),
    oldPrice: readNumber(value, ['oldPrice', 'compareAtPrice']),
  }
}

export default function CheckoutPage() {
  const { cart } = useCart()
  const hasFiredRef = useRef(false)

  const { items, itemsCount, subtotal, gaItems, currency } = useMemo(() => {
    const normalizedItems = (Array.isArray(cart) ? cart : [])
      .map(normalizeCartItem)
      .filter((item): item is CheckoutItem => item !== null)

    const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalSubtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const analyticsItems = normalizedItems.map((item) => {
      const source: Record<string, unknown> = {
        _id: item._id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        brand: item.brand,
        sku: item.sku,
        quantity: item.quantity,
      }

      return mapProductToGaItem(source)
    })

    return {
      items: normalizedItems,
      itemsCount: totalItems,
      subtotal: totalSubtotal,
      gaItems: analyticsItems,
      currency: detectCurrency(),
    }
  }, [cart])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (items.length === 0 || hasFiredRef.current) return
    hasFiredRef.current = true

    try {
      trackBeginCheckout({
        currency,
        value: subtotal,
        items: gaItems,
      })
    } catch {}

    try {
      pushDataLayer({
        event: 'begin_checkout',
        currency,
        value: subtotal,
        ecommerce: {
          currency,
          value: subtotal,
          items: gaItems,
        },
      })
    } catch {}
  }, [items.length, subtotal, currency, gaItems])

  const isEmpty = items.length === 0

  return (
    <main
      className="max-w-7xl mx-auto px-4 pt-28 pb-24 sm:px-6 lg:px-8"
      aria-labelledby="checkout-title"
      role="main"
    >
      <nav aria-label="Fil d’Ariane" className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/commande" aria-current="page" className="font-medium text-gray-700 dark:text-gray-200">
              Commande
            </Link>
          </li>
        </ol>
      </nav>

      <h1
        id="checkout-title"
        className="mb-3 text-center text-4xl font-extrabold tracking-tight text-brand dark:text-white"
      >
        Finaliser ma commande
      </h1>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {itemsCount} article{itemsCount > 1 ? 's' : ''} dans votre panier
      </p>

      {!isEmpty && (
        <div className="mt-6 flex justify-center">
          <FreeShippingBadge price={subtotal} withProgress />
        </div>
      )}

      {isEmpty ? (
        <section
          className="mt-12 text-center text-lg text-gray-600 dark:text-gray-400"
          role="alert"
          aria-live="polite"
        >
          <p className="mb-6">Votre panier est vide.</p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-accent px-5 py-2 font-semibold text-white shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            >
              Parcourir les produits
            </Link>

            <Link
              href="/products/packs"
              className="rounded-lg border border-gray-300 px-5 py-2 font-semibold hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Voir les packs
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-3" aria-live="polite">
            <section className="space-y-8 lg:col-span-2" aria-label="Articles du panier">
              <CartList items={items} />
            </section>

            <aside
              id="paiement"
              className="sticky top-24 h-fit space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 scroll-mt-28"
              aria-label="Résumé et paiement"
            >
              <CartSummary items={items} />
              <CheckoutForm />
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                🔒 Paiement sécurisé · ⚡ Livraison 48–72 h · ↩ Retours gratuits 30 j
              </p>
            </aside>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
            <div className="mx-4 mb-4 rounded-xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/95">
              <div className="flex items-center justify-between p-3">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Sous-total</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(subtotal)}
                  </p>
                </div>

                <a
                  href="#paiement"
                  className="rounded-lg bg-accent px-4 py-2 font-semibold text-white shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
                  aria-label="Aller au paiement"
                >
                  Payer
                </a>
              </div>
            </div>

            <div className="h-20" aria-hidden="true" />
          </div>
        </>
      )}
    </main>
  )
}