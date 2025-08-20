'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'
import { useCart } from '@/hooks/useCart'
import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import { logEvent } from '@/lib/logEvent'

// ces deux composants existent déjà chez toi
import CheckoutSteps from '@/components/ui/CheckoutSteps'
import TrustBadges from '@/components/TrustBadges'
// (DeliveryEstimate existe aussi chez toi)
import DeliveryEstimate from '@/components/ui/DeliveryEstimate'

export default function CheckoutPage() {
  const { cart } = useCart()
  const hasFiredRef = useRef(false)

  const { itemsCount, subtotal } = useMemo(() => {
    const itemsCount = (cart || []).reduce((s, it: any) => s + Math.max(1, Number(it?.quantity || 1)), 0)
    const subtotal = (cart || []).reduce(
      (s, it: any) => s + (Number(it?.price) || 0) * Math.max(1, Number(it?.quantity || 1)),
      0
    )
    return { itemsCount, subtotal }
  }, [cart])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!hasFiredRef.current && (cart?.length || 0) > 0) {
      hasFiredRef.current = true
      try {
        logEvent({
          action: 'begin_checkout',
          category: 'ecommerce',
          label: 'checkout_page',
          value: Math.round(subtotal * 100) / 100,
        })
      } catch {}
    }
  }, [cart?.length, subtotal])

  const isEmpty = !cart || cart.length === 0
  const currencyFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24" aria-labelledby="checkout-title" role="main">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d’Ariane" className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center gap-2">
          <li><Link href="/" prefetch={false} className="hover:underline">Accueil</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/produit" prefetch={false} className="hover:underline">Produits</Link></li>
          <li aria-hidden="true">/</li>
          <li><span aria-current="page" className="text-gray-700 dark:text-gray-200 font-medium">Commande</span></li>
        </ol>
      </nav>

      {/* Étapes : ton composant prend "step" (pas "current", pas d’autres props) */}
      <div className="mb-4">
        <CheckoutSteps step={2} />
      </div>

      <h1 id="checkout-title" className="text-4xl font-extrabold text-center mb-2 text-brand dark:text-white tracking-tight">
        Finaliser ma commande
      </h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
        {itemsCount} article{itemsCount > 1 ? 's' : ''} dans votre panier
      </p>

      {!isEmpty && (
        <div className="mt-6 flex justify-center">
          <FreeShippingBadge price={subtotal} withProgress />
        </div>
      )}

      {isEmpty ? (
        <section className="mt-12 text-center text-gray-600 dark:text-gray-400 text-lg" role="alert" aria-live="polite">
          <p className="mb-6">Votre panier est vide.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/produit"
              prefetch={false}
              className="rounded-lg bg-accent text-white px-5 py-2 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            >
              Parcourir les produits
            </Link>
            <Link
              href="/pack"
              prefetch={false}
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

              {/* Estimation livraison / réassurance */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-700 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimation de livraison</p>
                  <DeliveryEstimate />
                </div>
              </div>

              <CheckoutForm />

              {/* Réassurance paiements — ton composant n'accepte pas "compact" */}
              <div className="pt-2">
                <TrustBadges />
              </div>
            </aside>
          </div>

          {/* CTA mobile sticky vers la zone paiement */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
            <div className="mx-4 mb-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xl">
              <div className="flex items-center justify-between p-3">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Sous-total</p>
                  <p className="text-gray-600 dark:text-gray-400">{currencyFmt.format(subtotal)}</p>
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

          {/* (Optionnel) AbandonCartTracker exige des props email & cart chez toi.
              On le retire ici pour éviter l'erreur TS. On pourra le remettre en le branchant sur la session utilisateur. */}
        </>
      )}
    </main>
  )
}
