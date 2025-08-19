import { Suspense } from 'react'
import type { Metadata } from 'next'
import OrderList from '@/components/account/OrderList'

export const metadata: Metadata = {
  title: 'Mes commandes – TechPlay',
  description:
    'Consultez l’historique de vos commandes TechPlay, vérifiez leur statut et accédez aux détails en un clic.',
  alternates: { canonical: '/account/mes-commandes' },
}

function OrdersSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 space-y-3 animate-pulse"
    >
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="mt-2 h-3 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  )
}

export default async function MyOrdersPage() {
  // TODO: remplacer par les commandes de l’utilisateur connecté
  const mockOrders = [{ id: '12345' }, { id: '67890' }]

  return (
    <main
      id="main"
      className="max-w-4xl mx-auto px-4 pt-28 pb-20"
      aria-labelledby="orders-title"
      role="main"
    >
      <header className="text-center mb-8">
        <h1
          id="orders-title"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand dark:text-brand-light"
        >
          Mes commandes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Suivez vos commandes et accédez à leur détail.
        </p>
      </header>

      {/* ✅ Très important : le composant client qui utilise useSearchParams est sous Suspense */}
      <Suspense fallback={<OrdersSkeleton />}>
        <OrderList orders={mockOrders} />
      </Suspense>
    </main>
  )
}
