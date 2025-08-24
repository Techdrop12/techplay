import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Mon panier – TechPlay',
  description: 'Consultez les produits de votre panier avant de passer commande.',
}

const CartPageClient = dynamic(
  () => import('@/components/cart/CartPageClient'),
  { ssr: false, loading: () => <div className="py-16 text-center">Chargement du panier…</div> }
)

export default function CartPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Chargement…</div>}>
      <CartPageClient />
    </Suspense>
  )
}
