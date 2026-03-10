'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ProductTable() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products')
        if (!res.ok) throw new Error('Erreur API')

        const data = await res.json()
        if (mounted) {
          setProducts(Array.isArray(data) ? data : [])
        }
      } catch {
        toast.error('Erreur chargement produits')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchProducts()

    return () => {
      mounted = false
    }
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce produit ?')) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Suppression échouée')

      setProducts((prev) => prev.filter((product) => product._id !== id))
      toast.success('Produit supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-300">Chargement...</p>
  }

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="mb-4 text-2xl font-bold">📦 Produits en base</h2>

      <table className="min-w-full border border-gray-300 bg-white text-sm shadow dark:border-gray-700 dark:bg-gray-900">
        <thead>
          <tr className="bg-gray-100 text-left dark:bg-gray-800">
            <th className="border p-2">Titre</th>
            <th className="border p-2">Prix</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Slug</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                Aucun produit trouvé.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border p-2">{product.title}</td>
                <td className="border p-2">
                  {Number(product.price ?? 0).toFixed(2)} €
                </td>
                <td className="border p-2">{product.stock}</td>
                <td className="border p-2">{product.slug}</td>
                <td className="flex justify-center gap-2 border p-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/fr/admin/produit/${product._id}`)}
                    className="rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product._id)}
                    className="rounded bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}