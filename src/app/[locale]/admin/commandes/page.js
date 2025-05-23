'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminAnalyticsBlock from '@/components/AdminAnalyticsBlock' // ✅ Ajout

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch('/api/admin/products').then(res => res.json()).then(setProducts)
    fetch('/api/admin/orders').then(res => res.json()).then(setOrders)
  }, [])

  const totalCA = orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)

  const handleStatusChange = async (id, status) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    )
  }

  const exportCSV = () => {
    fetch('/api/export-orders')
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'commandes-techplay.csv'
        a.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => alert("Erreur lors de l'export CSV"))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      <AdminAnalyticsBlock /> {/* ✅ Bloc analytics intégré */}

      <div className="mb-6 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Commandes :</strong> {orders.length}</p>
        <p><strong>Chiffre d'affaires :</strong> {totalCA} €</p>
      </div>

      <div className="mb-6">
        <Link href="/admin/ajouter" className="text-white bg-green-600 px-4 py-2 rounded text-sm">
          ➕ Ajouter un produit
        </Link>
      </div>

      {/* 🚀 Bouton Export CSV */}
      <div className="mb-6">
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500"
        >
          📤 Exporter les commandes en CSV
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">📦 Produits ({products.length})</h2>
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p._id} className="border p-3 rounded">
              <strong>{p.title}</strong> – {p.price} €
              <Link
                href={`/admin/produit/${p._id}`}
                className="ml-4 text-sm text-blue-600 underline"
              >
                Modifier
              </Link>
              <button
                onClick={async () => {
                  if (confirm('Supprimer ce produit ?')) {
                    await fetch(`/api/admin/delete-product/${p._id}`, { method: 'DELETE' })
                    window.location.reload()
                  }
                }}
                className="text-red-600 text-sm ml-2"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">🧾 Commandes ({orders.length})</h2>
        <ul className="space-y-4 text-sm">
          {orders.map((order) => (
            <li key={order._id} className="border p-3 rounded">
              <p><strong>Email :</strong> {order.email}</p>
              <p><strong>Total :</strong> {order.total} €</p>
              <p><strong>Articles :</strong> {order.items.map(i => `${i.title} x${i.quantity}`).join(', ')}</p>
              <p><strong>Statut :</strong> {order.status}</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className="mt-2 p-1 border rounded"
              >
                <option value="en cours">En cours</option>
                <option value="expédiée">Expédiée</option>
                <option value="livrée">Livrée</option>
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
