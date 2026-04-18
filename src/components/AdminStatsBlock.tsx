'use client';

import { motion } from 'framer-motion';
import { BarChart2, ShoppingCart, Package, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

type Range = '7d' | '30d' | '90d' | 'all';

interface Stats {
  totalSales?: number;
  orders?: number;
  products?: number;
  averageBasket?: number;
  range?: string;
  generatedAt?: string;
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.15 }}
      className="bg-[hsl(var(--surface-2))] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col items-center justify-center gap-1"
    >
      <div className="text-[hsl(var(--accent))]">{icon}</div>
      <div className="text-lg font-bold text-[hsl(var(--text))]">{value}</div>
      <div className="text-xs text-token-text/60 text-center">{label}</div>
    </motion.div>
  );
}

const RANGES: { key: Range; labelKey: string }[] = [
  { key: '7d', labelKey: 'stats_range_7d' },
  { key: '30d', labelKey: 'stats_range_30d' },
  { key: '90d', labelKey: 'stats_range_90d' },
  { key: 'all', labelKey: 'stats_range_all' },
];

export default function AdminStatsBlock() {
  const t = useTranslations('admin');
  const [range, setRange] = useState<Range>('30d');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-token-text/60">
            {t('stats_eyebrow')}
          </p>
          <p className="text-sm font-semibold text-[hsl(var(--text))]">{t('stats_title')}</p>
        </div>
        <div
          role="group"
          aria-label={t('stats_range_aria')}
          className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-0.5"
        >
          {RANGES.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              aria-pressed={range === key}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${
                range === key
                  ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)]'
                  : 'text-token-text/70 hover:text-[hsl(var(--text))]'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {loading || !stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-[hsl(var(--surface-2))] animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <motion.div
          key={range}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm"
        >
          <StatCard
            icon={<BarChart2 size={20} />}
            label={t('stats_ca')}
            value={`${stats.totalSales ?? 0} €`}
          />
          <StatCard
            icon={<ShoppingCart size={20} />}
            label={t('stats_orders')}
            value={stats.orders ?? 0}
          />
          <StatCard
            icon={<Package size={20} />}
            label={t('stats_products')}
            value={stats.products ?? 0}
          />
          <StatCard
            icon={<ShoppingBag size={20} />}
            label={t('stats_basket')}
            value={`${stats.averageBasket ?? 0} €`}
          />
        </motion.div>
      )}

      <p className="mt-3 text-[11px] text-token-text/50">
        {t('stats_last_update')} :{' '}
        {stats?.generatedAt ? new Date(stats.generatedAt).toLocaleString() : '—'}
      </p>
    </div>
  );
}
