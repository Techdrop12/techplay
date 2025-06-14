// File: src/app/[locale]/admin/produit/ajouter/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import SEOHead from '@/components/SEOHead';

export default function AjouterProduit() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    price: '',
    image: '',
    slug: '',
    description: '',
    category: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success('Produit ajouté ✅');
      router.push(`/${router.locale}/admin/produit`);
    } else {
      toast.error('Erreur lors de l’ajout ❌');
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
            value={form.title}
            onChange={handleChange}
            placeholder={t('title')}
            required
            className="border p-2 w-full"
          />
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder={t('price')}
            required
            className="border p-2 w-full"
          />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder={t('image')}
            required
            className="border p-2 w-full"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug (URL)"
            required
            className="border p-2 w-full"
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder={t('category')}
            required
            className="border p-2 w-full"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t('description')}
            required
            className="border p-2 w-full"
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
