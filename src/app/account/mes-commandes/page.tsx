// src/app/account/mes-commandes/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Suspense } from 'react'

import type { OrderDoc } from '@/models/Order'
import type { Metadata } from 'next'

import OrderList, { type OrderSummary } from '@/components/account/OrderList'
import Link from '@/components/LocalizedLink'
import { getSession } from '@/lib/auth'
import { getUserOrders } from '@/lib/db/orders'

export const metadata: Metadata = {
  title: 'Mes commandes – TechPlay',
  description: 'Historique et suivi de vos commandes TechPlay.',
  robots: { index: false, follow: false },
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  )
}

async function OrdersContent() {
  const session = await getSession()
  const email = session?.user?.email?.trim()

  if (!email) {
    return (
      <main
        className="max-w-4xl mx-auto px-4 py-10"
        aria-labelledby="orders-title"
        role="main"
      >
        <h1 id="orders-title" className="text-2xl font-bold mb-6">
          Mes commandes
        </h1>
        <div
          className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
          role="status"
        >
          <p className="text-gray-600 dark:text-gray-300">
            Connectez-vous pour voir l’historique de vos commandes.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/40"
          >
            Se connecter
          </Link>
        </div>
      </main>
    )
  }

  const rawOrders = await getUserOrders(email)
  type OrderWithId = OrderDoc & { _id?: { toString: () => string } }
  const orders: OrderSummary[] = rawOrders.map((o: OrderWithId) => ({
    id: o._id?.toString() ?? '',
    date: o.createdAt,
    total: o.total ?? undefined,
    itemsCount: Array.isArray(o.items) ? o.items.length : 0,
    status: o.status ?? undefined,
  }))

  return (
    <main
      className="max-w-4xl mx-auto px-4 py-10"
      aria-labelledby="orders-title"
      role="main"
    >
      <h1 id="orders-title" className="text-2xl font-bold mb-6">
        Mes commandes
      </h1>
      <OrderList orders={orders} />
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
