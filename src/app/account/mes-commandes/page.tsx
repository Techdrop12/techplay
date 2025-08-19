// src/app/account/mes-commandes/page.tsx
import { Suspense } from 'react'
import type { Metadata } from 'next'
import OrderList from '@/components/account/OrderList'

export const metadata: Metadata = {
  title: 'Mes commandes – TechPlay',
  description: 'Historique et suivi de vos commandes TechPlay.',
  robots: { index: false, follow: false },
}

/**
 * ⚠️ Certains composants enfants (actuels ou futurs) peuvent utiliser useSearchParams().
 * Next.js exige un <Suspense> autour du subtree de la page pour le prerender.
 * Cette page est donc systématiquement encapsulée.
 */
export default function MyOrdersPage() {
  // À brancher sur la session utilisateur
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

      <Suspense fallback={<OrdersSkeleton />}>
        <OrderList orders={mockOrders} />
      </Suspense>
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
