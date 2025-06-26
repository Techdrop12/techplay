// ✅ src/components/AdminStatsBlock.js
import React, { useEffect, useState } from "react";

export default function AdminStatsBlock() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setStats);
  }, []);
  if (!stats) return <div>Chargement stats…</div>;

  return (
    <div className="bg-white rounded shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Statistiques du site</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-2xl font-bold">{stats.totalSales} €</div>
          <div className="text-sm text-gray-500">Chiffre d’affaires</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.orders}</div>
          <div className="text-sm text-gray-500">Commandes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.products}</div>
          <div className="text-sm text-gray-500">Produits actifs</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.averageBasket} €</div>
          <div className="text-sm text-gray-500">Panier moyen</div>
        </div>
      </div>
      <div className="mt-4">
        <span className="text-sm text-gray-600">
          Dernière MAJ : {stats.generatedAt}
        </span>
      </div>
    </div>
  );
}
