'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import TableSkeleton from '@/components/admin/TableSkeleton';

const STATUS_OPTIONS = [
  'en cours',
  'en préparation',
  'payée',
  'expédiée',
  'livrée',
  'annulée',
] as const;
const PAGE_SIZE = 25;

interface OrderItem {
  title?: string;
}

interface OrderRow {
  _id: string;
  name?: string;
  email?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  createdAt?: string;
}

export default function OrderTable() {
  const t = useTranslations('admin');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const textFiltersRef = useRef({
    searchQuery,
    minTotal,
    maxTotal,
    fromDate,
    toDate,
  });
  textFiltersRef.current = { searchQuery, minTotal, maxTotal, fromDate, toDate };

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const { searchQuery: q, minTotal: minT, maxTotal: maxT, fromDate: from, toDate: to } =
      textFiltersRef.current;
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (statusFilter) params.set('status', statusFilter);
    if (q.trim()) params.set('q', q.trim());
    if (minT.trim()) params.set('minTotal', minT.trim());
    if (maxT.trim()) params.set('maxTotal', maxT.trim());
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    fetch(`/api/admin/orders?${params}`)
      .then((res) => res.json())
      .then((data: { items?: OrderRow[]; total?: number; pages?: number }) => {
        setOrders(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total) ?? 0);
        setPages(Math.max(1, Number(data?.pages) ?? 1));
      })
      .catch(() => toast.error(t('error_load_orders')))
      .finally(() => setLoading(false));
  }, [page, statusFilter, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const applyFilters = () => {
    setPage(1);
    fetchOrders();
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || t('update_error'));
      }
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(t('status_updated'));
      fetchOrders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('status_update_error'));
    }
  };

  const filteredOrders = orders;

  const exportCsv = () => {
    const headers = ['Date', 'Client', 'Email', 'Produits', 'Montant (€)', 'Statut'];
    const rows = filteredOrders.map((o) => [
      o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 19) : '',
      (o.name ?? '').replace(/"/g, '""'),
      (o.email ?? '').replace(/"/g, '""'),
      (o.items?.map((i: OrderItem) => i.title).join(' ; ') ?? '').replace(/"/g, '""'),
      String(o.total ?? 0),
      (o.status ?? '').replace(/"/g, '""'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
      '\r\n'
    );
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('csv_exported'));
  };

  if (loading) {
    return <TableSkeleton rows={8} cols={6} ariaLabel={t('loading_orders')} />;
  }
  if (!orders.length) return <p className="text-token-text/70 p-4">{t('no_orders')}</p>;

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <h2 className="text-2xl font-bold text-[hsl(var(--text))]">{t('orders_title')}</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('filter_status')}
        >
          <option value="">{t('all_statuses')}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-sm text-token-text/70">
          {t('orders_page_info', { page, pages, total })}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1.5 text-sm disabled:opacity-50"
          aria-label={t('pagination_prev')}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= pages || loading}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1.5 text-sm disabled:opacity-50"
          aria-label={t('pagination_next')}
        >
          →
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        >
          {t('export_csv')}
        </button>
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-end text-xs">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label htmlFor="orders-search" className="mb-1 font-medium text-token-text/80">
              {t('orders_search_label')}
            </label>
            <input
              id="orders-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('orders_search_placeholder')}
              className="w-40 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="orders-min-total" className="mb-1 font-medium text-token-text/80">
              {t('orders_min_total')}
            </label>
            <input
              id="orders-min-total"
              type="number"
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              className="w-28 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="orders-max-total" className="mb-1 font-medium text-token-text/80">
              {t('orders_max_total')}
            </label>
            <input
              id="orders-max-total"
              type="number"
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
              className="w-28 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2 justify-start md:justify-end">
          <div className="flex flex-col">
            <label htmlFor="orders-from-date" className="mb-1 font-medium text-token-text/80">
              {t('orders_from_date')}
            </label>
            <input
              id="orders-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="orders-to-date" className="mb-1 font-medium text-token-text/80">
              {t('orders_to_date')}
            </label>
            <input
              id="orders-to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[11px] font-medium text-token-text/80 hover:bg-[hsl(var(--surface-2))]"
          >
            {t('advanced_filters_apply')}
          </button>
        </div>
      </div>
      <table className="min-w-full table-auto border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm">
        <thead>
          <tr className="bg-[hsl(var(--surface-2))]">
            <th className="p-2 border border-[hsl(var(--border))]">{t('orders_client')}</th>
            <th className="p-2 border border-[hsl(var(--border))]">{t('contact_email')}</th>
            <th className="p-2 border border-[hsl(var(--border))]">{t('orders_products')}</th>
            <th className="p-2 border border-[hsl(var(--border))]">{t('orders_amount')}</th>
            <th className="p-2 border border-[hsl(var(--border))]">{t('orders_status')}</th>
            <th className="p-2 border border-[hsl(var(--border))]">{t('orders_date')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o._id} className="border-t border-[hsl(var(--border))]">
              <td className="p-2">{o.name}</td>
              <td className="p-2">{o.email}</td>
              <td className="p-2">{o.items?.map((i: OrderItem) => i.title).join(', ')}</td>
              <td className="p-2">{o.total} €</td>
              <td className="p-2">
                <select
                  value={o.status ?? ''}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                  aria-label={t('change_order_status_aria', { id: o._id })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredOrders.length === 0 && !loading && (
        <p className="text-token-text/60 p-4">
          {statusFilter ? t('no_orders_filter') : t('no_orders')}
        </p>
      )}
    </div>
  );
}
