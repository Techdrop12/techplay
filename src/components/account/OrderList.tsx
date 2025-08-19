'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import InvoiceButton from './InvoiceButton'
import { cn, formatPrice } from '@/lib/utils'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled' | string

export type OrderSummary = {
  id: string
  date?: string | number | Date
  total?: number
  itemsCount?: number
  status?: OrderStatus
}

interface Props {
  orders: OrderSummary[]
  className?: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  canceled: 'Annulée',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

function formatDateSafe(input?: string | number | Date) {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return d.toLocaleString()
  }
}

export default function OrderList({ orders = [], className }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'recent' | 'old' | 'amountAsc' | 'amountDesc'>('recent')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let base = Array.isArray(orders) ? [...orders] : []

    if (q) {
      base = base.filter((o) => o.id?.toLowerCase().includes(q))
    }

    base.sort((a, b) => {
      if (sort === 'recent') {
        return (new Date(b.date || 0).getTime() || 0) - (new Date(a.date || 0).getTime() || 0)
      }
      if (sort === 'old') {
        return (new Date(a.date || 0).getTime() || 0) - (new Date(b.date || 0).getTime() || 0)
      }
      if (sort === 'amountAsc') {
        return (a.total || 0) - (b.total || 0)
      }
      if (sort === 'amountDesc') {
        return (b.total || 0) - (a.total || 0)
      }
      return 0
    })

    return base
  }, [orders, query, sort])

  if (!orders || orders.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Vous n’avez pas encore de commande.
        </p>
        <Link
          href="/produit"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/40"
        >
          Découvrir les produits
        </Link>
      </div>
    )
  }

  return (
    <section className={cn('space-y-4', className)} aria-label="Liste des commandes">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {filtered.length} commande{filtered.length > 1 ? 's' : ''}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2">
            <span className="sr-only">Rechercher une commande</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par n° de commande…"
              className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-zinc-900"
              aria-label="Rechercher par numéro de commande"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="sr-only">Trier</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-zinc-900"
              aria-label="Trier les commandes"
            >
              <option value="recent">Plus récentes</option>
              <option value="old">Plus anciennes</option>
              <option value="amountDesc">Montant décroissant</option>
              <option value="amountAsc">Montant croissant</option>
            </select>
          </label>
        </div>
      </div>

      {/* Liste */}
      <ul className="space-y-4" role="list">
        {filtered.map((order) => {
          const statusKey = (order.status || '').toLowerCase()
          const badgeClass =
            STATUS_STYLE[statusKey] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          const statusLabel = STATUS_LABEL[statusKey] || order.status || '—'

          return (
            <li
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-zinc-900"
              aria-label={`Commande ${order.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      Commande <span className="text-gray-500">#{order.id}</span>
                    </p>
                    <span
                      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeClass)}
                      aria-label={`Statut : ${statusLabel}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatDateSafe(order.date)} ·{' '}
                    {order.itemsCount ?? '—'} article{(order.itemsCount || 0) > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="text-sm">
                    Total :{' '}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {order.total != null ? formatPrice(order.total) : '—'}
                    </strong>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/account/mes-commandes/${order.id}`}
                      className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent dark:border-gray-700 dark:hover:bg-zinc-800"
                      aria-label={`Voir le détail de la commande ${order.id}`}
                    >
                      Détail
                    </Link>
                    <InvoiceButton orderId={order.id} />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
