import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

import InvoiceButton from '@/components/account/InvoiceButton'
import Link from '@/components/LocalizedLink'
import { getSession } from '@/lib/auth'
import { getOrderById } from '@/lib/db/orders'
import { formatDateTime } from '@/lib/formatDate'
import { formatPrice } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Commande #${id} – TechPlay`,
    description: `Détails de la commande n°${id} sur TechPlay.`,
    alternates: { canonical: `/account/mes-commandes/${id}` },
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { id: orderId } = await params
  const session = await getSession()
  const order = await getOrderById(orderId)

  if (!order) {
    notFound()
  }

  const email = session?.user?.email?.toLowerCase().trim()
  const orderEmail = (order.user?.email ?? order.email ?? '').toLowerCase().trim()
  const isOwner = !!email && !!orderEmail && email === orderEmail

  if (!isOwner) {
    notFound()
  }

  const items = Array.isArray(order.items) ? order.items : []
  const address = order.user?.address ?? (order as { shippingDetails?: { address?: string } }).shippingDetails?.address ?? '—'
  const status = order.status ?? '—'
  const trackingNumber = order.trackingNumber
  const shippingProvider = order.shippingProvider

  return (
    <main
      className="max-w-2xl mx-auto px-4 pt-28 pb-20"
      aria-labelledby="order-title"
      role="main"
    >
      <div className="mb-6">
        <Link
          href="/account/mes-commandes"
          className="text-sm text-accent hover:underline"
          aria-label="Retour à la liste de mes commandes"
        >
          ← Retour à mes commandes
        </Link>
      </div>

      <h1
        id="order-title"
        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand dark:text-brand-light"
      >
        Commande #{orderId}
      </h1>

      <p className="mt-3 text-muted-foreground">
        {order.createdAt ? formatDateTime(order.createdAt, 'fr-FR') : '—'}
      </p>

      <section
        className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6"
        aria-label="Résumé de la commande"
      >
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Statut
          </h2>
          <p className="mt-1 font-medium">{status}</p>
        </div>

        {items.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Articles
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700" role="list">
              {items.map((line: { title?: string | null; quantity?: number | null; price?: number | null }, idx: number) => (
                <li key={idx} className="py-3 first:pt-0 flex justify-between items-start gap-4">
                  <span className="text-gray-900 dark:text-gray-100">
                    {line.title ?? 'Article'} × {Number(line.quantity) || 1}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPrice((Number(line.price) || 0) * (Number(line.quantity) || 1))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Adresse de livraison
          </h2>
          <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">{address}</p>
        </div>

        {(trackingNumber || shippingProvider) && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Suivi
            </h2>
            <p className="mt-1">
              {shippingProvider && <span className="font-medium">{shippingProvider}</span>}
              {shippingProvider && trackingNumber && ' · '}
              {trackingNumber && (
                <span className="tabular-nums">{trackingNumber}</span>
              )}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <span className="text-lg font-bold">
            Total : {typeof order.total === 'number' ? formatPrice(order.total) : '—'}
          </span>
          <InvoiceButton
            orderId={orderId}
            items={items.map((line: { title?: string | null; quantity?: number | null; price?: number | null }) => ({
              name: line.title ?? 'Article',
              quantity: Number(line.quantity) || 1,
              price: Number(line.price) || 0,
            }))}
            total={typeof order.total === 'number' ? order.total : undefined}
          />
        </div>
      </section>
    </main>
  )
}
