'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import InvoiceButton from './InvoiceButton';

import Link from '@/components/LocalizedLink';
import { formatDateTime } from '@/lib/formatDate';
import { cn, formatPrice } from '@/lib/utils';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled' | string;
type SortOption = 'recent' | 'old' | 'amountAsc' | 'amountDesc';

export type OrderSummary = {
  id: string;
  date?: string | number | Date;
  total?: number;
  itemsCount?: number;
  status?: OrderStatus;
};

interface Props {
  orders: OrderSummary[];
  className?: string;
}

const STATUS_KEYS = ['pending', 'paid', 'shipped', 'delivered', 'canceled'] as const;

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function isSortOption(value: string): value is SortOption {
  return value === 'recent' || value === 'old' || value === 'amountAsc' || value === 'amountDesc';
}

function toTimestamp(input?: string | number | Date): number {
  if (!input) return 0;
  const date = new Date(input);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
}

function normalizeStatus(status?: OrderStatus): string {
  return typeof status === 'string' ? status.toLowerCase() : '';
}

export default function OrderList({ orders = [], className }: Props) {
  const locale = useLocale();
  const t = useTranslations('orders');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = Array.isArray(orders) ? [...orders] : [];

    if (q) {
      base = base.filter((order) => order.id.toLowerCase().includes(q));
    }

    base.sort((a, b) => {
      const dateA = toTimestamp(a.date);
      const dateB = toTimestamp(b.date);
      const totalA = typeof a.total === 'number' ? a.total : 0;
      const totalB = typeof b.total === 'number' ? b.total : 0;

      switch (sort) {
        case 'recent':
          return dateB - dateA;
        case 'old':
          return dateA - dateB;
        case 'amountAsc':
          return totalA - totalB;
        case 'amountDesc':
          return totalB - totalA;
        default:
          return 0;
      }
    });

    return base;
  }, [orders, query, sort]);

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-token-text/75">{t('no_orders_found')}</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/40"
        >
          {t('discover_products')}
        </Link>
      </div>
    );
  }

  return (
    <section className={cn('space-y-4', className)} aria-label={t('list_aria')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {t('orders_count', { count: filtered.length })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2">
            <span className="sr-only">{t('search_aria')}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm sm:w-64"
              aria-label={t('search_aria')}
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">{t('sort_aria')}</span>
            <select
              value={sort}
              onChange={(e) => {
                const value = e.target.value;
                if (isSortOption(value)) setSort(value);
              }}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm"
              aria-label={t('sort_aria')}
            >
              <option value="recent">{t('sort_recent')}</option>
              <option value="old">{t('sort_old')}</option>
              <option value="amountDesc">{t('sort_amount_desc')}</option>
              <option value="amountAsc">{t('sort_amount_asc')}</option>
            </select>
          </label>
        </div>
      </div>

      <ul className="space-y-4" role="list">
        {filtered.map((order) => {
          const statusKey = normalizeStatus(order.status);
          const badgeClass =
            STATUS_STYLE[statusKey] || 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]';
          const statusLabel = STATUS_KEYS.includes(statusKey as (typeof STATUS_KEYS)[number])
            ? t(`statuses.${statusKey}`)
            : (order.status as string) || '—';
          const itemsCount = typeof order.itemsCount === 'number' ? order.itemsCount : 0;

          return (
            <li
              key={order.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]"
              aria-label={`${t('order_label')} ${order.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {t('order_label')} <span className="text-token-text/60">#{order.id}</span>
                    </p>

                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        badgeClass
                      )}
                      aria-label={`Statut : ${statusLabel}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {order.date
                      ? formatDateTime(order.date, locale === 'en' ? 'en-GB' : 'fr-FR')
                      : '—'}{' '}
                    · {t('articles_count', { count: itemsCount || 0 })}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="text-sm">
                    {t('order_total_label')}{' '}
                    <strong className="text-[hsl(var(--text))]">
                      {typeof order.total === 'number' ? formatPrice(order.total) : '—'}
                    </strong>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/account/mes-commandes/${order.id}`}
                      className="inline-flex items-center rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                      aria-label={t('view_order_aria', { id: order.id })}
                    >
                      {t('detail_btn')}
                    </Link>

                    <InvoiceButton orderId={order.id} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
