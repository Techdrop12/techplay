'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch('/api/admin/products').then(res => res.json()).then(setProducts)
    fetch('/api/admin/orders').then(res => res.json()).then(setOrders)
  }, [])

  const totalCA = orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Commandes :</strong> {orders.length}</p>
        <p><strong>Chiffre d'affaires :</strong> {totalCA} €</p>
      </div>

      <div className="mb-6">
        <Link href="/admin/ajouter" className="text-white bg-green-600 px-4 py-2 rounded text-sm">
          ➕ Ajouter un produit
        </Link>
      </div>

      {/* ✅ Lien d’export CSV des produits */}
      <div className="mb-2">
        <a
          href="/api/admin/export-products"
          target="_blank"
          className="text-sm text-blue-600 underline"
        >
          📤 Exporter les produits (CSV)
        </a>
      </div>

      {/* ✅ Lien d’export CSV des commandes */}
      <div className="mb-6">
        <a
          href="/api/admin/export-orders"
          target="_blank"
          className="text-sm text-blue-600 underline"
        >
          🧾 Exporter les commandes (CSV)
        </a>
      </div>

      {/* ✅ Synchronisation des stocks fournisseur */}
      <div className="mb-6">
        <button
          onClick={async () => {
            const confirmSync = confirm('Tu veux synchroniser les stocks ?')
            if (!confirmSync) return

            const res = await fetch('/api/admin/sync-stock', {
              method: 'POST',
            })
            const data = await res.json()
            alert(`✅ ${data.updated} produits mis à jour.`)
            window.location.reload()
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🔄 Synchroniser les stocks fournisseur
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
        <ul className="space-y-2 text-sm">
          {orders.map((order) => (
            <li key={order._id} className="border p-3 rounded">
              <p><strong>Email :</strong> {order.email}</p>
              <p><strong>Total :</strong> {order.total} €</p>
              <p><strong>Articles :</strong> {order.items.map(i => `${i.title} x${i.quantity}`).join(', ')}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
