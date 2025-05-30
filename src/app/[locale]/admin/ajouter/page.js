'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AjouterProduitPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    price: '',
    image: '',
    images: '',
    slug: '',
    category: '',
    stock: '10',
    tags: '',
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      tags: form.tags.split(',').map(t => t.trim()),
      images: form.images.split(',').map(i => i.trim()),
    }

    const res = await fetch('/api/admin/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success('✅ Produit ajouté')
      router.push('/admin')
    } else {
      const err = await res.json()
      toast.error(err.error || "Erreur lors de l'ajout")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">➕ Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Titre" value={form.title} onChange={handleChange} required className="border p-2 w-full" />
        <input name="price" type="number" placeholder="Prix (€)" value={form.price} onChange={handleChange} required className="border p-2 w-full" />
        <input name="image" placeholder="Image principale (URL)" value={form.image} onChange={handleChange} required className="border p-2 w-full" />
        <input name="images" placeholder="Images secondaires (URLs séparées par virgules)" value={form.images} onChange={handleChange} className="border p-2 w-full" />
        <input name="slug" placeholder="Slug (ex: souris-rgb)" value={form.slug} onChange={handleChange} required className="border p-2 w-full" />
        <input name="category" placeholder="Catégorie" value={form.category} onChange={handleChange} required className="border p-2 w-full" />
        <input name="stock" type="number" placeholder="Stock initial" value={form.stock} onChange={handleChange} required className="border p-2 w-full" />
        <input name="tags" placeholder="Tags (ex: promo, nouveauté)" value={form.tags} onChange={handleChange} className="border p-2 w-full" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="border p-2 w-full" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">
          ✅ Enregistrer
        </button>
      </form>
    </div>
  )
}
