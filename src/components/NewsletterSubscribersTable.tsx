'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import TableSkeleton from '@/components/admin/TableSkeleton';

interface Subscriber {
  _id: string;
  email: string;
  locale?: string;
  pathname?: string;
  createdAt?: string;
}

const PAGE_SIZE = 50;

export default function NewsletterSubscribersTable() {
  const t = useTranslations('admin');
  const [items, setItems] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(
    async (skip: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/newsletter-subscribers?limit=${PAGE_SIZE}&skip=${skip}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Erreur');
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch {
        toast.error(t('error_load_newsletter'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchPage(page * PAGE_SIZE);
  }, [page, fetchPage]);

  const exportCsv = () => {
    const headers = ['Email', 'Locale', 'Page', 'Date'];
    const rows = items.map((s) => [
      (s.email ?? '').replace(/"/g, '""'),
      (s.locale ?? '').replace(/"/g, '""'),
      (s.pathname ?? '').replace(/"/g, '""'),
      s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 19) : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
      '\r\n'
    );
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('csv_exported'));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading && items.length === 0) {
    return <TableSkeleton rows={6} cols={4} ariaLabel={t('loading_newsletter')} />;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-token-text/70">
          {total} inscrit{total !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('newsletter_export_csv')}
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm disabled:opacity-50"
            aria-label={t('pagination_prev')}
          >
            ←
          </button>
          <span className="text-sm text-token-text/70">
            {t('newsletter_page_info', { page: page + 1, pages: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1 || loading}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm disabled:opacity-50"
            aria-label={t('pagination_next')}
          >
            →
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-token-text/60">{t('no_newsletter')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" aria-label={t('newsletter_table_aria')}>
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-left">
                <th className="px-4 py-2">{t('newsletter_email')}</th>
                <th className="px-4 py-2">{t('newsletter_locale')}</th>
                <th className="px-4 py-2">{t('newsletter_path')}</th>
                <th className="px-4 py-2">{t('newsletter_date')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
                >
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.locale ?? '—'}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{s.pathname ?? '—'}</td>
                  <td className="px-4 py-2 text-token-text/70">
                    {s.createdAt ? new Date(s.createdAt).toLocaleString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
