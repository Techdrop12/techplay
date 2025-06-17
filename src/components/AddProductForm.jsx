'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AddProductForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    image: '',
    images: [],
    category: '',
    stock: 0,
    tags: '',
  });
  const [loading, setLoading] = useState(false);

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
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          tags: formData.tags.split(',').map((t) => t.trim()),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      toast.success('Produit ajouté');
      router.push('/fr/admin/produit');
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow"
      aria-label="Formulaire d'ajout de produit"
    >
      <h2 className="text-xl font-semibold">Ajouter un produit</h2>

      <label htmlFor="title" className="block font-medium">
        Titre <span aria-hidden="true">*</span>
      </label>
      <input
        id="title"
        type="text"
        name="title"
        placeholder="Titre"
        value={formData.title}
        onChange={handleChange}
        required
        aria-required="true"
        className="w-full border px-3 py-2 rounded"
      />

      <label htmlFor="slug" className="block font-medium">
        Slug (URL) <span aria-hidden="true">*</span>
      </label>
      <input
        id="slug"
        type="text"
        name="slug"
        placeholder="Slug (URL)"
        value={formData.slug}
        onChange={handleChange}
        required
        aria-required="true"
        className="w-full border px-3 py-2 rounded"
      />

      <label htmlFor="description" className="block font-medium">
        Description <span aria-hidden="true">*</span>
      </label>
      <textarea
        id="description"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
        aria-required="true"
        className="w-full border px-3 py-2 rounded"
      />

      <label htmlFor="price" className="block font-medium">
        Prix (€) <span aria-hidden="true">*</span>
      </label>
      <input
        id="price"
        type="number"
        name="price"
        placeholder="Prix (€)"
        value={formData.price}
        onChange={handleChange}
        required
        aria-required="true"
        className="w-full border px-3 py-2 rounded"
        min="0"
        step="0.01"
      />

      <label htmlFor="image" className="block font-medium">
        URL image principale <span aria-hidden="true">*</span>
      </label>
      <input
        id="image"
        type="text"
        name="image"
        placeholder="URL image principale"
        value={formData.image}
        onChange={handleChange}
        required
        aria-required="true"
        className="w-full border px-3 py-2 rounded"
      />

      <label htmlFor="images" className="block font-medium">
        Autres images (séparées par virgules)
      </label>
      <input
        id="images"
        type="text"
        name="images"
        placeholder="Autres images (séparées par virgules)"
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            images: e.target.value.split(',').map((i) => i.trim()),
          }))
        }
        className="w-full border px-3 py-2 rounded"
      />

      <label htmlFor="category" className="block font-medium">
        Catégorie
      </label>
      <input
        id="category"
        type="text"
        name="category"
        placeholder="Catégorie"
        value={formData.category}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />

      <label htmlFor="stock" className="block font-medium">
        Stock
      </label>
      <input
        id="stock"
        type="number"
        name="stock"
        placeholder="Stock"
        value={formData.stock}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        min="0"
      />

      <label htmlFor="tags" className="block font-medium">
        Tags (séparés par virgules)
      </label>
      <input
        id="tags"
        type="text"
        name="tags"
        placeholder="Tags (séparés par virgules)"
        value={formData.tags}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        {loading ? 'Enregistrement...' : 'Ajouter'}
      </button>
    </form>
  );
}
