'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AjouterProduit() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    image: '',
    slug: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      toast.success('Produit ajouté 🎉')
      router.push('/admin')
    } else {
      toast.error('Erreur lors de l’ajout')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Titre" onChange={handleChange} className="border p-2 w-full" required />
        <input name="price" placeholder="Prix" type="number" onChange={handleChange} className="border p-2 w-full" required />
        <input name="image" placeholder="URL image" onChange={handleChange} className="border p-2 w-full" required />
        <input name="slug" placeholder="Slug (ex: mon-produit)" onChange={handleChange} className="border p-2 w-full" required />
        <textarea name="description" placeholder="Description" onChange={handleChange} className="border p-2 w-full" required />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Ajouter</button>
      </form>
    </div>
  )
}
