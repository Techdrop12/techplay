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
        className="mx-auto max-w-4xl px-4 py-10"
        aria-labelledby="orders-title"
        role="main"
      >
        <h1 id="orders-title" className="mb-6 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Mes commandes
        </h1>
        <div
          className="rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 p-8 text-center dark:bg-[hsl(var(--surface))]/40"
          role="status"
        >
          <p className="text-gray-600 dark:text-gray-300">
            Connectez-vous pour voir l&apos;historique de vos commandes.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
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
      className="mx-auto max-w-4xl px-4 py-10"
      aria-labelledby="orders-title"
      role="main"
    >
      <h1 id="orders-title" className="mb-6 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        Mes commandes
      </h1>
      <OrderList orders={orders} />
    </main>
  )
}

function OrdersSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10" role="main" aria-busy="true">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[hsl(var(--surface-2))]" />
      <div className="space-y-4" role="status" aria-live="polite">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[1.5rem] border border-white/10 bg-[hsl(var(--surface))]/80 p-5"
          >
            <div className="mb-3 h-4 w-48 rounded-lg bg-[hsl(var(--surface-2))]" />
            <div className="h-8 w-40 rounded-lg bg-[hsl(var(--surface-2))]" />
          </div>
        ))}
      </div>
    </main>
  )
}
