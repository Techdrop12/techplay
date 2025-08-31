'use client';

import { useEffect, useState } from 'react';

export default function AdminAnalyticsBlock() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <p className="text-red-500 text-sm">Erreur de chargement des statistiques</p>;
  }

  if (!data) {
    return <p className="text-gray-500 text-sm animate-pulse">Chargement des statistiques…</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
      <StatCard label="👥 Visiteurs uniques (30j)" value={data.users} />
      <StatCard label="📈 Pages vues" value={data.pageViews} />
      <StatCard label="🛒 Taux de conversion" value={`${data.conversionRate?.toFixed(2)} %`} />
      <StatCard label="💰 Chiffre d’affaires" value={`${data.totalRevenue?.toFixed(2)} €`} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
