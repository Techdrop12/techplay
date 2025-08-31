// src/app/account/mes-commandes/page.tsx
export const dynamic = 'force-dynamic'   // ✅ pas de SSG pour une page compte
export const revalidate = 0              // ✅ toujours frais côté serveur

import { Suspense } from 'react'
import type { Metadata } from 'next'
import OrderList from '@/components/account/OrderList'

export const metadata: Metadata = {
  title: 'Mes commandes – TechPlay',
  description: 'Historique et suivi de vos commandes TechPlay.',
  robots: { index: false, follow: false },
}

/**
 * Page totalement encapsulée dans <Suspense> pour satisfaire Next 15
 * lorsque des sous-composants utilisent useSearchParams().
 */
export default function MyOrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  )
}

function OrdersContent() {
  // À connecter à la session utilisateur ensuite
  const mockOrders = [{ id: '12345' }, { id: '67890' }]

  return (
    <main
      className="max-w-4xl mx-auto px-4 py-10"
      aria-labelledby="orders-title"
      role="main"
    >
      <h1 id="orders-title" className="text-2xl font-bold mb-6">
        Mes commandes
      </h1>
      <OrderList orders={mockOrders} />
    </main>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded border border-gray-200 dark:border-zinc-800 p-4"
        >
          <div className="h-4 w-48 bg-gray-200 dark:bg-zinc-800 rounded mb-3" />
          <div className="h-8 w-40 bg-gray-200 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  )
}
