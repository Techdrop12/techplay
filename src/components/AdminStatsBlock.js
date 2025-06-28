'use client';

import { useEffect, useState } from 'react';
import { BarChart2, ShoppingCart, Package, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminStatsBlock() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return <p className="text-sm text-gray-500 animate-pulse">Chargement des statistiques…</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded shadow p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">📊 Statistiques globales</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <StatCard icon={<BarChart2 size={20} />} label="CA total" value={`${stats.totalSales} €`} />
        <StatCard icon={<ShoppingCart size={20} />} label="Commandes" value={stats.orders} />
        <StatCard icon={<Package size={20} />} label="Produits actifs" value={stats.products} />
        <StatCard icon={<ShoppingBag size={20} />} label="Panier moyen" value={`${stats.averageBasket} €`} />
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Dernière mise à jour : {new Date(stats.generatedAt).toLocaleString()}
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-50 dark:bg-zinc-800 rounded p-4 shadow-inner flex flex-col items-center justify-center"
    >
      <div className="mb-2 text-blue-600 dark:text-blue-400">{icon}</div>
      <div className="text-lg font-bold text-gray-800 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </motion.div>
  );
}
