'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function EditProductForm({ productId }) {
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const data = await res.json();
        setFormData({
          ...data,
          tags: data.tags?.join(', ') || '',
        });
      } catch (err) {
        toast.error('Erreur chargement produit');
      }
    }
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          tags: formData.tags.split(',').map((t) => t.trim()),
        }),
      });

      if (!res.ok) throw new Error('Erreur modification');
      toast.success('Produit mis à jour');
      router.push('/fr/admin/produit');
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <p>Chargement...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Modifier un produit</h2>

      <input name="title" value={formData.title} onChange={handleChange} placeholder="Titre" className="w-full border p-2" required />
      <input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" className="w-full border p-2" required />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border p-2" required />
      <input name="price" value={formData.price} onChange={handleChange} placeholder="Prix" className="w-full border p-2" required />
      <input name="image" value={formData.image} onChange={handleChange} placeholder="Image principale" className="w-full border p-2" required />
      <input name="images" value={formData.images} onChange={handleChange} placeholder="Images supplémentaires (optionnel)" className="w-full border p-2" />
      <input name="category" value={formData.category} onChange={handleChange} placeholder="Catégorie" className="w-full border p-2" />
      <input name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" className="w-full border p-2" />
      <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (séparés par virgules)" className="w-full border p-2" />

      <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}
