import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import InvoiceButton from '@/components/account/InvoiceButton';
import Link from '@/components/LocalizedLink';
import { getSession } from '@/lib/auth';
import { getOrderById } from '@/lib/db/orders';
import { formatDateTime } from '@/lib/formatDate';
import { formatPrice } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Commande #${id} – TechPlay`,
    description: `Détails de la commande n°${id} sur TechPlay.`,
    alternates: { canonical: `/account/mes-commandes/${id}` },
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id: orderId } = await params;
  const t = await getTranslations('account');
  const tOrders = await getTranslations('orders');
  const session = await getSession();
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const email = session?.user?.email?.toLowerCase().trim();
  const orderEmail = (order.user?.email ?? order.email ?? '').toLowerCase().trim();
  const isOwner = !!email && !!orderEmail && email === orderEmail;

  if (!isOwner) {
    notFound();
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const address =
    order.user?.address ??
    (order as { shippingDetails?: { address?: string } }).shippingDetails?.address ??
    '—';
  const status = order.status ?? '—';
  const trackingNumber = order.trackingNumber;
  const shippingProvider = order.shippingProvider;

  return (
    <main
      className="container-app mx-auto max-w-2xl px-4 pt-24 pb-20 sm:px-6"
      aria-labelledby="order-title"
      role="main"
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/account"
          className="text-[13px] font-medium text-token-text/70 transition hover:text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          aria-label={t('back_to_account')}
        >
          {t('back_to_account')}
        </Link>
        <span className="text-[13px] text-token-text/50" aria-hidden="true">
          /
        </span>
        <Link
          href="/account/mes-commandes"
          className="text-[13px] font-medium text-[hsl(var(--accent))] transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          aria-label={t('back_to_orders_aria')}
        >
          {t('link_my_orders')}
        </Link>
      </div>

      <h1 id="order-title" className="heading-page sm:text-3xl">
        {tOrders('order_id_display', { id: orderId })}
      </h1>

      <p className="mt-3 text-[15px] text-token-text/75">
        {order.createdAt ? formatDateTime(order.createdAt, 'fr-FR') : '—'}
      </p>

      <section
        className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8"
        aria-label={t('order_summary_aria')}
      >
        <div>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-token-text/60">
            {tOrders('status')}
          </h2>
          <p className="mt-1 text-[15px] font-medium">{status}</p>
        </div>

        {items.length > 0 && (
          <div>
            <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-token-text/60">
              {tOrders('articles_heading')}
            </h2>
            <ul className="divide-y divide-[hsl(var(--border))]" role="list">
              {items.map(
                (
                  line: { title?: string | null; quantity?: number | null; price?: number | null },
                  idx: number
                ) => (
                  <li key={idx} className="py-3 first:pt-0 flex justify-between items-start gap-4">
                    <span className="text-[15px] text-[hsl(var(--text))]">
                      {line.title ?? 'Article'} × {Number(line.quantity) || 1}
                    </span>
                    <span className="font-medium tabular-nums text-[15px]">
                      {formatPrice((Number(line.price) || 0) * (Number(line.quantity) || 1))}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-token-text/60">
            {tOrders('delivery_address_heading')}
          </h2>
          <p className="mt-1 whitespace-pre-line text-[15px] text-token-text/85">{address}</p>
        </div>

        {(trackingNumber || shippingProvider) && (
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-token-text/60">
              {tOrders('tracking_heading')}
            </h2>
            <p className="mt-1">
              {shippingProvider && <span className="font-medium">{shippingProvider}</span>}
              {shippingProvider && trackingNumber && ' · '}
              {trackingNumber && <span className="tabular-nums">{trackingNumber}</span>}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <span className="text-[15px] font-bold">
            {tOrders('order_total_label')}{' '}
            {typeof order.total === 'number' ? formatPrice(order.total) : '—'}
          </span>
          <InvoiceButton
            orderId={orderId}
            items={items.map(
              (line: {
                title?: string | null;
                quantity?: number | null;
                price?: number | null;
              }) => ({
                name: line.title ?? 'Article',
                quantity: Number(line.quantity) || 1,
                price: Number(line.price) || 0,
              })
            )}
            total={typeof order.total === 'number' ? order.total : undefined}
          />
        </div>
      </section>
    </main>
  );
}
