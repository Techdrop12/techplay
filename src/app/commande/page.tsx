// src/app/commande/page.tsx — FINAL (GA4 begin_checkout helper + GTM + UX)
'use client'

import Link from '@/components/LocalizedLink'
import { useEffect, useMemo, useRef } from 'react'
import { useCart } from '@/hooks/useCart'
import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import { mapProductToGaItem, trackBeginCheckout, pushDataLayer } from '@/lib/ga'

/** Devise simple (EUR/GBP/USD) */
function detectCurrency(): 'EUR' | 'GBP' | 'USD' {
  try {
    const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang || '' : ''
    const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
    const src = (htmlLang || nav).toLowerCase()
    if (src.includes('gb') || src.endsWith('-uk') || src.includes('en-gb')) return 'GBP'
    if (src.includes('us') || src.includes('en-us')) return 'USD'
    if (src.startsWith('en')) return 'USD'
    return 'EUR'
  } catch {
    return 'EUR'
  }
}

export default function CheckoutPage() {
  const { cart } = useCart()
  const hasFiredRef = useRef(false)

  // Items GA4 + totaux
  const { itemsCount, subtotal, gaItems, currency } = useMemo(() => {
    const items = Array.isArray(cart) ? cart : []
    const itemsCount = items.reduce((s, it: any) => s + Math.max(1, Number(it?.quantity || 1)), 0)
    const subtotal = items.reduce(
      (s, it: any) => s + (Number(it?.price) || 0) * Math.max(1, Number(it?.quantity || 1)),
      0
    )
    const gaItems = items.map((it: any) =>
      mapProductToGaItem(it, {
        quantity: Math.max(1, Number(it?.quantity || 1)),
      })
    )
    const currency = detectCurrency()
    return { itemsCount, subtotal, gaItems, currency }
  }, [cart])

  // Scroll top + begin_checkout une seule fois quand il y a du contenu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!cart?.length || hasFiredRef.current) return
    hasFiredRef.current = true

    try {
      // GA4 “canonique”
      trackBeginCheckout({ currency, value: subtotal, items: gaItems })
    } catch {}

    try {
      // GTM (si tu lis dans le dataLayer)
      pushDataLayer({
        event: 'begin_checkout',
        currency,
        value: subtotal,
        ecommerce: { currency, value: subtotal, items: gaItems },
      })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.length])

  const isEmpty = !cart || cart.length === 0

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24"
      aria-labelledby="checkout-title"
      role="main"
    >
      {/* Fil d'Ariane simple */}
      <nav aria-label="Fil d’Ariane" className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:underline">Accueil</Link></li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/commande" aria-current="page" className="text-gray-700 dark:text-gray-200 font-medium">
              Commande
            </Link>
          </li>
        </ol>
      </nav>

      <h1
        id="checkout-title"
        className="text-4xl font-extrabold text-center mb-3 text-brand dark:text-white tracking-tight"
      >
        Finaliser ma commande
      </h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {itemsCount} article{itemsCount > 1 ? 's' : ''} dans votre panier
      </p>

      {/* Badge livraison gratuite basé sur le sous-total */}
      {!isEmpty && (
        <div className="mt-6 flex justify-center">
          <FreeShippingBadge price={subtotal} withProgress />
        </div>
      )}

      {isEmpty ? (
        <section
          className="mt-12 text-center text-gray-600 dark:text-gray-400 text-lg"
          role="alert"
          aria-live="polite"
        >
          <p className="mb-6">Votre panier est vide.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/produit"
              className="rounded-lg bg-accent text-white px-5 py-2 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            >
              Parcourir les produits
            </Link>
            <Link
              href="/pack"
              className="rounded-lg border border-gray-300 dark:border-zinc-700 px-5 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Voir les packs
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="mt-10 grid lg:grid-cols-3 gap-10 items-start" aria-live="polite">
            {/* Liste panier */}
            <section className="lg:col-span-2 space-y-8" aria-label="Articles du panier">
              <CartList items={cart} />
            </section>

            {/* Résumé + Paiement */}
            <aside
              id="paiement"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6 space-y-8 h-fit sticky top-24"
              aria-label="Résumé et paiement"
            >
              <CartSummary items={cart} />
              <CheckoutForm />
            </aside>
          </div>

          {/* CTA mobile sticky vers la zone paiement */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
            <div className="mx-4 mb-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xl">
              <div className="flex items-center justify-between p-3">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Sous-total</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(subtotal)}
                  </p>
                </div>
                <a
                  href="#paiement"
                  className="rounded-lg bg-accent text-white px-4 py-2 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
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
