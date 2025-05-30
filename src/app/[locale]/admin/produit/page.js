'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AdminProduitsPage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(() => toast.error('Erreur de chargement des produits'))
  }, [])

  const deleteProduct = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      const res = await fetch(`/api/admin/delete-product/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id))
        toast.success('Produit supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🛠️ Gestion des produits</h1>

      <div className="mb-6">
        <Link
          href="/admin/ajouter"
          className="bg-green-600 text-white px-4 py-2 rounded text-sm"
        >
          ➕ Ajouter un produit
        </Link>
      </div>

      <ul className="space-y-3">
        {products.length === 0 && (
          <p className="text-gray-500">Aucun produit pour le moment.</p>
        )}
        {products.map((p) => (
          <li
            key={p._id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-gray-500">{p.price} € – {p.category}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/produit/${p._id}`}
                className="text-blue-600 underline"
              >
                Modifier
              </Link>
              <button
                onClick={() => deleteProduct(p._id)}
                className="text-red-600"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
