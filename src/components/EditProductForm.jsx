'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function EditProductForm({ productId }) {
  const router = useRouter()
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}`)
        if (!res.ok) throw new Error('Produit non trouvé')

        const data = await res.json()

        if (!mounted) return

        setFormData({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          images: Array.isArray(data.images) ? data.images : [],
          stock: data.stock ?? 0,
        })
      } catch {
        toast.error('Erreur chargement produit')
      }
    }

    if (productId) {
      void fetchProduct()
    }

    return () => {
      mounted = false
    }
  }, [productId])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData) return

    setLoading(true)

    try {
      const payload = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock, 10) || 0,
        tags: String(formData.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        images:
          typeof formData.images === 'string'
            ? formData.images
                .split(',')
                .map((img) => img.trim())
                .filter(Boolean)
            : Array.isArray(formData.images)
              ? formData.images
              : [],
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erreur modification')

      toast.success('Produit mis à jour')
      router.push('/fr/admin/produit')
    } catch {
      toast.error('Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (!formData) {
    return <p>Chargement...</p>
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-4 rounded bg-white p-4 shadow"
    >
      <h2 className="text-xl font-bold">Modifier un produit</h2>

      <input
        name="title"
        value={formData.title ?? ''}
        onChange={handleChange}
        placeholder="Titre"
        className="w-full rounded border px-3 py-2"
        required
      />

      <input
        name="slug"
        value={formData.slug ?? ''}
        onChange={handleChange}
        placeholder="Slug (URL)"
        className="w-full rounded border px-3 py-2"
        required
      />

      <textarea
        name="description"
        value={formData.description ?? ''}
        onChange={handleChange}
        placeholder="Description"
        className="w-full rounded border px-3 py-2"
        required
      />

      <input
        name="price"
        type="number"
        step="0.01"
        value={formData.price ?? ''}
        onChange={handleChange}
        placeholder="Prix (€)"
        className="w-full rounded border px-3 py-2"
        required
      />

      <input
        name="image"
        value={formData.image ?? ''}
        onChange={handleChange}
        placeholder="URL image principale"
        className="w-full rounded border px-3 py-2"
        required
      />

      <input
        name="images"
        value={Array.isArray(formData.images) ? formData.images.join(', ') : formData.images ?? ''}
        onChange={handleChange}
        placeholder="Images supplémentaires (séparées par virgules)"
        className="w-full rounded border px-3 py-2"
      />

      <input
        name="category"
        value={formData.category ?? ''}
        onChange={handleChange}
        placeholder="Catégorie"
        className="w-full rounded border px-3 py-2"
      />

      <input
        name="stock"
        type="number"
        value={formData.stock ?? 0}
        onChange={handleChange}
        placeholder="Stock"
        className="w-full rounded border px-3 py-2"
      />

      <input
        name="tags"
        value={formData.tags ?? ''}
        onChange={handleChange}
        placeholder="Tags (séparés par virgules)"
        className="w-full rounded border px-3 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}