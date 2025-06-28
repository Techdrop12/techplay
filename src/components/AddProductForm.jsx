'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    image: '',
    images: '',
    category: '',
    stock: '',
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || 'Erreur lors de la création');
      }

      toast.success('✅ Produit ajouté');
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
      className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center">Ajouter un produit</h2>

      {[
        { name: 'title', label: 'Titre', type: 'text' },
        { name: 'slug', label: 'Slug (URL)', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'price', label: 'Prix (€)', type: 'number' },
        { name: 'image', label: 'Image principale (URL)', type: 'text' },
        { name: 'images', label: 'Autres images (séparées par virgule)', type: 'text' },
        { name: 'category', label: 'Catégorie', type: 'text' },
        { name: 'stock', label: 'Stock', type: 'number' },
        { name: 'tags', label: 'Tags (séparés par virgule)', type: 'text' },
      ].map(({ name, label, type }) =>
        type === 'textarea' ? (
          <textarea
            key={name}
            name={name}
            placeholder={label}
            value={formData[name]}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded resize-none"
          />
        ) : (
          <input
            key={name}
            type={type}
            name={name}
            placeholder={label}
            value={formData[name]}
            onChange={handleChange}
            required={['title', 'slug', 'description', 'price', 'image'].includes(name)}
            className="w-full border px-3 py-2 rounded"
          />
        )
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition"
      >
        {loading ? 'Enregistrement…' : 'Ajouter le produit'}
      </button>
    </form>
  );
}
