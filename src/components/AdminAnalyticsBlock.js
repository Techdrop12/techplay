// ✅ src/components/AdminAnalyticsBlock.js

'use client';

import { useEffect, useState } from 'react';

export default function AdminAnalyticsBlock() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-gray-400 animate-pulse">Chargement statistiques…</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-6 my-8">
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="text-xl font-bold">{data.orders}</div>
        <div className="text-xs text-gray-600">Commandes</div>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="text-xl font-bold">{data.revenue.toFixed(2)} €</div>
        <div className="text-xs text-gray-600">CA total</div>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="text-xl font-bold">{data.avgOrder.toFixed(2)} €</div>
        <div className="text-xs text-gray-600">Panier moyen</div>
      </div>
    </div>
  );
}
