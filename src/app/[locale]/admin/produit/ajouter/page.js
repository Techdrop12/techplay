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
    stock: 0,
    tags: '',
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      tags: form.tags.split(',').map((t) => t.trim()),
      images: typeof form.images === 'string' ? form.images.split(',').map((i) => i.trim()) : form.images,
    };

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(t('product_added') || 'Produit ajouté ✅');
      router.push(`/${router.locale}/admin/produit`);
    } else {
      toast.error(t('product_add_error') || 'Erreur lors de l’ajout ❌');
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
            className="border p-2 w-full"
          />
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder={t('stock')}
            className="border p-2 w-full"
          />
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder={t('tags')}
            className="border p-2 w-full"
          />
          <input
            name="images"
            value={typeof form.images === 'string' ? form.images : form.images.join(', ')}
            onChange={handleChange}
            placeholder={t('additional_images')}
            className="border p-2 w-full"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t('description')}
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
