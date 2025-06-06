// File: src/app/[locale]/admin/id/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import SEOHead from '@/components/SEOHead';

export default function EditProduit() {
  const t = useTranslations('admin');
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setForm)
      .catch(() => toast.error('Erreur lors du chargement'));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setForm({ ...form, [name]: value.split(',').map((t) => t.trim()) });
    } else if (name === 'images') {
      setForm({ ...form, [name]: value.split(',').map((img) => img.trim()) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Produit modifié');
      router.push(`/${router.locale}/admin`);
    } else {
      toast.error('Erreur lors de la modification');
    }
  };

  if (!form) {
    return <p className="p-6 text-center text-gray-500">{t('loading') || 'Chargement...'}</p>;
  }

  return (
    <>
      <SEOHead
        overrideTitle={t('dashboard')}
        overrideDescription={`Modifier : ${form.title}`}
      />
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Modifier le produit</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder={t('title')}
            className="border p-2 w-full"
            required
          />
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder={t('price')}
            className="border p-2 w-full"
            required
          />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder={t('image')}
            className="border p-2 w-full"
            required
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
            className="border p-2 w-full"
            required
          />
          <input
            name="category"
            value={form.category || ''}
            onChange={handleChange}
            placeholder={t('category')}
            className="border p-2 w-full"
          />
          <input
            name="stock"
            type="number"
            value={form.stock || 0}
            onChange={handleChange}
            placeholder="Stock"
            className="border p-2 w-full"
          />
          <input
            name="tags"
            value={form.tags?.join(', ') || ''}
            onChange={handleChange}
            placeholder="Tags (ex : console, nouveauté)"
            className="border p-2 w-full"
          />
          <input
            name="images"
            value={form.images?.join(', ') || ''}
            onChange={handleChange}
            placeholder="Autres images (URLs séparées par virgule)"
            className="border p-2 w-full"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t('description')}
            className="border p-2 w-full"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </>
  );
}
