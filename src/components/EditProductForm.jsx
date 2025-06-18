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
        if (!res.ok) throw new Error('Produit non trouvé');
        const data = await res.json();
        setFormData({
          ...data,
          tags: data.tags?.join(', ') || '',
          images: data.images || [],
          stock: data.stock || 0,
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
          images: typeof formData.images === 'string' 
            ? formData.images.split(',').map(i => i.trim()) 
            : formData.images,
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Modifier un produit</h2>

      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Titre"
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        placeholder="Slug (URL)"
        className="w-full border px-3 py-2 rounded"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        name="price"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={handleChange}
        placeholder="Prix (€)"
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        name="image"
        value={formData.image}
        onChange={handleChange}
        placeholder="URL image principale"
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        name="images"
        value={Array.isArray(formData.images) ? formData.images.join(', ') : formData.images}
        onChange={handleChange}
        placeholder="Images supplémentaires (séparées par virgules)"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Catégorie"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="stock"
        type="number"
        value={formData.stock}
        onChange={handleChange}
        placeholder="Stock"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Tags (séparés par virgules)"
        className="w-full border px-3 py-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}
