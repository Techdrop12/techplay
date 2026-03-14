'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface ProductRow {
  _id: string;
  title: string;
  price: number;
  stock: number;
  slug: string;
}

export default function ProductTable() {
  const t = useTranslations('admin')
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setProducts(data)
      } catch {
        toast.error(t('error_load_products'))
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [t])

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setProducts((prev) => prev.filter((p) => p._id !== id))
      toast.success(t('product_deleted'))
    } catch {
      toast.error(t('error_delete'))
    }
  }

  if (loading) {
    return (
      <p className="text-center text-token-text/60" role="status" aria-live="polite">
        {t('loading_products')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto p-4" aria-label={t('products_title')}>
      <h2 className="text-2xl font-bold mb-4">📦 {t('products_title')}</h2>
      <table className="min-w-full text-sm bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-[var(--shadow-sm)]">
        <thead>
          <tr className="bg-[hsl(var(--surface-2))] text-left">
            <th className="p-2 border">Titre</th>
            <th className="p-2 border">Prix</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Slug</th>
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-token-text/60">
                Aucun produit trouvé.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p._id} className="hover:bg-[hsl(var(--surface-2))] border-t border-[hsl(var(--border))]">
                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">{p.price.toFixed(2)} €</td>
                <td className="p-2 border">{p.stock}</td>
                <td className="p-2 border">{p.slug}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => router.push(`/fr/admin/produit/${p._id}`)}
                    className="bg-[hsl(var(--accent))] hover:opacity-95 text-[hsl(var(--accent-fg))] px-3 py-1 rounded transition"
                    aria-label={t('modify')}
                  >
                    {t('modify')}
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                    aria-label={t('delete')}
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
