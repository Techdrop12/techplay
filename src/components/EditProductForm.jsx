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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto"
      aria-label="Formulaire modification produit"
    >
      <h2 className="text-xl font-bold">Modifier un produit</h2>

      <label htmlFor="title" className="block font-medium">
        Titre <span aria-hidden="true">*</span>
      </label>
      <input
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Titre"
        className="w-full border p-2"
        required
        aria-required="true"
      />

      <label htmlFor="slug" className="block font-medium">
        Slug <span aria-hidden="true">*</span>
      </label>
      <input
        id="slug"
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        placeholder="Slug"
        className="w-full border p-2"
        required
        aria-required="true"
      />

      <label htmlFor="description" className="block font-medium">
        Description <span aria-hidden="true">*</span>
      </label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border p-2"
        required
        aria-required="true"
      />

      <label htmlFor="price" className="block font-medium">
        Prix <span aria-hidden="true">*</span>
      </label>
      <input
        id="price"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Prix"
        className="w-full border p-2"
        required
        aria-required="true"
        type="number"
        min="0"
        step="0.01"
      />

      <label htmlFor="image" className="block font-medium">
        Image principale <span aria-hidden="true">*</span>
      </label>
      <input
        id="image"
        name="image"
        value={formData.image}
        onChange={handleChange}
        placeholder="Image principale"
        className="w-full border p-2"
        required
        aria-required="true"
      />

      <label htmlFor="images" className="block font-medium">
        Images supplémentaires (optionnel)
      </label>
      <input
        id="images"
        name="images"
        value={formData.images}
        onChange={handleChange}
        placeholder="Images supplémentaires (optionnel)"
        className="w-full border p-2"
      />

      <label htmlFor="category" className="block font-medium">
        Catégorie
      </label>
      <input
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Catégorie"
        className="w-full border p-2"
      />

      <label htmlFor="stock" className="block font-medium">
        Stock
      </label>
      <input
        id="stock"
        name="stock"
        value={formData.stock}
        onChange={handleChange}
        placeholder="Stock"
        className="w-full border p-2"
        type="number"
        min="0"
      />

      <label htmlFor="tags" className="block font-medium">
        Tags (séparés par virgules)
      </label>
      <input
        id="tags"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Tags (séparés par virgules)"
        className="w-full border p-2"
      />

      <button
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
        type="submit"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}
