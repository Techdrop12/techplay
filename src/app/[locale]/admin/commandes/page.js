'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminAnalyticsBlock from '@/components/AdminAnalyticsBlock'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/products').then(res => res.json()).then(setProducts)
    fetch('/api/admin/orders').then(res => res.json()).then(setOrders)
  }, [])

  const totalCA = orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)

  const updateStatus = async (id, newStatus) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })

    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
    )
  }

  const deleteProduct = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      await fetch(`/api/admin/delete-product/${id}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p._id !== id))
    }
  }

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎛️ Tableau de bord Admin</h1>

      <AdminAnalyticsBlock />

      <div className="mb-6 bg-gray-100 p-4 rounded">
        <p><strong>Commandes :</strong> {orders.length}</p>
        <p><strong>Chiffre d'affaires :</strong> {totalCA} €</p>
      </div>

      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/admin/ajouter"
          className="bg-green-600 text-white px-4 py-2 rounded text-sm"
        >
          ➕ Ajouter un produit
        </Link>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option value="all">Toutes les commandes</option>
          <option value="en cours">En cours</option>
          <option value="expédiée">Expédiée</option>
          <option value="livrée">Livrée</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">🧾 Commandes ({filteredOrders.length})</h2>
          <ul className="space-y-4 text-sm">
            {filteredOrders.map((order) => (
              <li key={order._id} className="border p-4 rounded shadow-sm">
                <p><strong>Email :</strong> {order.email}</p>
                <p><strong>Total :</strong> {order.total} €</p>
                <p><strong>Articles :</strong> {order.items.map(i => `${i.title} x${i.quantity}`).join(', ')}</p>
                <p>
                  <strong>Statut :</strong>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    order.status === 'en cours' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'expédiée' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.status}
                  </span>
                </p>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="mt-2 p-2 border rounded text-sm"
                >
                  <option value="en cours">En cours</option>
                  <option value="expédiée">Expédiée</option>
                  <option value="livrée">Livrée</option>
                </select>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">📦 Produits ({products.length})</h2>
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p._id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-gray-500">{p.price} €</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/produit/${p._id}`}
                    className="text-blue-600 underline text-sm"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="text-red-600 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
