'use client';

import { motion } from 'framer-motion';
import { BarChart2, ShoppingCart, Package, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

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
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return <p className="text-sm text-token-text/60 animate-pulse">Chargement des statistiques…</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded shadow p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-6 text-[hsl(var(--text))]">📊 Statistiques globales</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <StatCard icon={<BarChart2 size={20} />} label="CA total" value={`${stats.totalSales ?? 0} €`} />
        <StatCard icon={<ShoppingCart size={20} />} label="Commandes" value={stats.orders ?? 0} />
        <StatCard icon={<Package size={20} />} label="Produits actifs" value={stats.products ?? 0} />
        <StatCard icon={<ShoppingBag size={20} />} label="Panier moyen" value={`${stats.averageBasket ?? 0} €`} />
      </div>
      <div className="mt-4 text-xs text-token-text/60">
        Dernière mise à jour : {stats.generatedAt ? new Date(stats.generatedAt).toLocaleString() : '—'}
      </div>
    </motion.div>
  );
}
