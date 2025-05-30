'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AjouterProduit() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    price: '',
    image: '',
    slug: '',
    description: '',
    category: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      toast.success('Produit ajouté ✅')
      router.push('/admin/produits')
    } else {
      toast.error('Erreur lors de l’ajout ❌')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Ajouter un nouveau produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Nom du produit" required className="border p-2 w-full" />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Prix" required className="border p-2 w-full" />
        <input name="image" value={form.image} onChange={handleChange} placeholder="URL image" required className="border p-2 w-full" />
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (URL)" required className="border p-2 w-full" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Catégorie" required className="border p-2 w-full" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="border p-2 w-full" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Ajouter</button>
      </form>
    </div>
  )
}
