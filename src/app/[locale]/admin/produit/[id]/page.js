'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function EditProduit() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState(null)

  useEffect(() => {
    fetch(`/api/admin/product/${id}`)
      .then(res => res.json())
      .then(setForm)
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`/api/admin/product/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      toast.success('Produit modifié')
      router.push('/admin')
    } else {
      toast.error('Erreur lors de la modification')
    }
  }

  if (!form) return <p className="p-6">Chargement...</p>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Modifier le produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} className="border p-2 w-full" required />
        <input name="price" type="number" value={form.price} onChange={handleChange} className="border p-2 w-full" required />
        <input name="image" value={form.image} onChange={handleChange} className="border p-2 w-full" required />
        <input name="slug" value={form.slug} onChange={handleChange} className="border p-2 w-full" required />
        <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" required />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Enregistrer</button>
      </form>
    </div>
  )
}
