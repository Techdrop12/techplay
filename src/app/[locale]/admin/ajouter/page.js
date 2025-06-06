// File: src/app/[locale]/admin/ajouter/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import SEOHead from '@/components/SEOHead';

export default function AjouterProduitPage() {
  const t = useTranslations('admin');
  const router = useRouter();
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      tags: form.tags.split(',').map((t) => t.trim()),
      images: form.images.split(',').map((i) => i.trim()),
    };

    const res = await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(t('success'));
      router.push(`/${router.locale}/admin`);
    } else {
      const err = await res.json();
      toast.error(err.error || t('error'));
    }
  };

  return (
    <>
      <SEOHead
        overrideTitle={t('add_product')}
        overrideDescription={t('add_product')}
      />
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4">{t('add_product')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder={t('title')}
            value={form.title}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="price"
            type="number"
            placeholder={t('price')}
            value={form.price}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="image"
            placeholder={t('image')}
            value={form.image}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="images"
            placeholder="Images secondaires (URLs séparées par virgule)"
            value={form.images}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <input
            name="slug"
            placeholder="Slug (ex: souris-rgb)"
            value={form.slug}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="category"
            placeholder={t('category')}
            value={form.category}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="stock"
            type="number"
            placeholder="Stock initial"
            value={form.stock}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="tags"
            placeholder="Tags (ex: promo, nouveauté)"
            value={form.tags}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <textarea
            name="description"
            placeholder={t('description')}
            value={form.description}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded w-full"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </>
  );
}
