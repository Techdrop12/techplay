'use client';

import { ArrowDownRight, ArrowUpRight, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import Link from '@/components/LocalizedLink';

type TopProduct = {
  id: string;
  title: string;
  totalRevenue: number;
  orders: number;
};

type WeakProduct = {
  id: string;
  title: string;
  lastOrderAt?: string | null;
};

type InsightsData = {
  topProducts: TopProduct[];
  weakProducts: WeakProduct[];
  ordersTrend: { last7d: number; prev7d: number };
  customers: { repeatCount: number; newCount: number };
};

export default function AdminInsightsBlock() {
  const t = useTranslations('admin');
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/insights')
      .then((res) => res.json())
      .then((res) => {
        if (res?.ok === false) {
          setError(true);
          return;
        }
        setData(res?.data ?? res);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
        {t('insights_error')}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-xs text-token-text/60 animate-pulse" aria-live="polite">
        {t('insights_loading')}
      </p>
    );
  }

  const { topProducts, weakProducts, ordersTrend, customers } = data;
  const trendDiff = ordersTrend.last7d - ordersTrend.prev7d;
  const trendPositive = trendDiff >= 0;

  return (
    <section
      aria-label={t('insights_section_aria')}
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]"
    >
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
            <LineChart className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-token-text/60">
              {t('insights_eyebrow')}
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--text))]">
              {t('insights_title')}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-token-text/80">
              {t('insights_top_products')}
            </p>
          </div>
          <ul className="space-y-1.5 text-xs">
            {topProducts.length === 0 ? (
              <li className="text-token-text/60">{t('insights_top_products_empty')}</li>
            ) : (
              topProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-[hsl(var(--surface-2))] px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[hsl(var(--text))]">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-token-text/60">
                      {t('insights_top_products_meta', {
                        revenue: p.totalRevenue,
                        orders: p.orders,
                      })}
                    </div>
                  </div>
                  <Link
                    href={`/admin/produit/${p.id}`}
                    className="ml-2 inline-flex items-center rounded-md border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--accent))] hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                  >
                    {t('insights_view')}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-token-text/80">
            {t('insights_weak_products')}
          </p>
          <ul className="space-y-1.5 text-xs">
            {weakProducts.length === 0 ? (
              <li className="text-token-text/60">{t('insights_weak_products_empty')}</li>
            ) : (
              weakProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-2 py-1.5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="text-[11px] opacity-80">
                      {p.lastOrderAt
                        ? t('insights_weak_products_last', {
                            date: new Date(p.lastOrderAt).toLocaleDateString(),
                          })
                        : t('insights_weak_products_never')}
                    </div>
                  </div>
                  <Link
                    href={`/admin/produit/${p.id}`}
                    className="ml-2 inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-white/70 px-2 py-0.5 text-[10px] font-medium text-amber-900 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-black/20 dark:text-amber-50"
                  >
                    {t('insights_view')}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-token-text/80">
            {t('insights_orders_customers')}
          </p>
          <div className="space-y-2 rounded-md bg-[hsl(var(--surface-2))] px-2 py-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {trendPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className="font-medium text-[hsl(var(--text))]">
                  {t('insights_orders_7d')}
                </span>
              </div>
              <span className="font-semibold">
                {ordersTrend.last7d}{' '}
                <span className="text-[11px] text-token-text/60">
                  ({trendDiff >= 0 ? '+' : ''}
                  {trendDiff})
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium text-[hsl(var(--text))]">
                  {t('insights_customers_repeat')}
                </span>
              </div>
              <span className="font-semibold">{customers.repeatCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-sky-500" />
                <span className="font-medium text-[hsl(var(--text))]">
                  {t('insights_customers_new')}
                </span>
              </div>
              <span className="font-semibold">{customers.newCount}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

