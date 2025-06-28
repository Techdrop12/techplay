'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function OrderTable() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => toast.error('Erreur chargement commandes'));
  }, []);

  if (!orders.length) return <p className="text-gray-500 p-4">Aucune commande pour le moment.</p>;

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Commandes</h2>
      <table className="min-w-full table-auto border border-gray-300 bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Produits</th>
            <th className="p-2 border">Montant</th>
            <th className="p-2 border">Statut</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t">
              <td className="p-2">{o.name}</td>
              <td className="p-2">{o.email}</td>
              <td className="p-2">{o.items?.map(i => i.title).join(', ')}</td>
              <td className="p-2">{o.total} €</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
