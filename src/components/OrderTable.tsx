'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface OrderItem {
  title?: string;
}

interface OrderRow {
  _id: string;
  name?: string;
  email?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  createdAt?: string;
}

export default function OrderTable() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data: OrderRow[]) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erreur chargement commandes'));
  }, []);

  if (!orders.length) return <p className="text-token-text/70 p-4">Aucune commande pour le moment.</p>;

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-[hsl(var(--text))]">Commandes</h2>
      <table className="min-w-full table-auto border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm">
        <thead>
          <tr className="bg-[hsl(var(--surface-2))]">
            <th className="p-2 border border-[hsl(var(--border))]">Client</th>
            <th className="p-2 border border-[hsl(var(--border))]">Email</th>
            <th className="p-2 border border-[hsl(var(--border))]">Produits</th>
            <th className="p-2 border border-[hsl(var(--border))]">Montant</th>
            <th className="p-2 border border-[hsl(var(--border))]">Statut</th>
            <th className="p-2 border border-[hsl(var(--border))]">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-[hsl(var(--border))]">
              <td className="p-2">{o.name}</td>
              <td className="p-2">{o.email}</td>
              <td className="p-2">{o.items?.map((i: OrderItem) => i.title).join(', ')}</td>
              <td className="p-2">{o.total} €</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
