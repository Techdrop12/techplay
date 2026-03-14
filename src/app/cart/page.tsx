import { Suspense } from 'react'

import type { Metadata } from 'next'

import CartPageClient from '@/components/cart/CartPageClient'
import CartPageFallback from '@/components/cart/CartPageFallback'

export const metadata: Metadata = {
  title: 'Mon panier – TechPlay',
  description: 'Finalisez votre panier en toute confiance. Livraison offerte dès 49 €, paiement sécurisé, retours gratuits sous 30 jours.',
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageFallback />}>
      <CartPageClient />
    </Suspense>
  )
}
