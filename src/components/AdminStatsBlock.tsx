'use client'

import { motion } from 'framer-motion'
import { BarChart2, ShoppingCart, Package, ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import type { ReactNode } from 'react'

interface Stats {
  totalSales?: number;
  orders?: number;
  products?: number;
  averageBasket?: number;
  generatedAt?: string;
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-[hsl(var(--surface-2))] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col items-center justify-center"
    >
      <div className="mb-2 text-[hsl(var(--accent))]">{icon}</div>
      <div className="text-lg font-bold text-[hsl(var(--text))]">{value}</div>
      <div className="text-xs text-token-text/60">{label}</div>
    </motion.div>
  );
}

export default function AdminStatsBlock() {
  const t = useTranslations('admin')
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  if (!stats) {
    return <p className="text-sm text-token-text/60 animate-pulse">{t('loading_stats')}</p>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded shadow p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-6 text-[hsl(var(--text))]">📊 {t('stats_title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <StatCard icon={<BarChart2 size={20} />} label={t('stats_ca')} value={`${stats.totalSales ?? 0} €`} />
        <StatCard icon={<ShoppingCart size={20} />} label={t('stats_orders')} value={stats.orders ?? 0} />
        <StatCard icon={<Package size={20} />} label={t('stats_products')} value={stats.products ?? 0} />
        <StatCard icon={<ShoppingBag size={20} />} label={t('stats_basket')} value={`${stats.averageBasket ?? 0} €`} />
      </div>
      <div className="mt-4 text-xs text-token-text/60">
        {t('stats_last_update')} : {stats.generatedAt ? new Date(stats.generatedAt).toLocaleString() : '—'}
      </div>
    </motion.div>
  );
}
