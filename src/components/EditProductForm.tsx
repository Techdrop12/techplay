'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface EditProductFormProps {
  productId: string;
}

interface EditProductFormData {
  title?: string;
  slug?: string;
  description?: string;
  price?: string | number;
  oldPrice?: string | number;
  stock?: string | number;
  category?: string;
  tags?: string | string[];
  images?: string | string[];
  image?: string;
}

export default function EditProductForm({ productId }: EditProductFormProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [formData, setFormData] = useState<EditProductFormData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        if (!res.ok) throw new Error(t('product_not_found'));
        const data = await res.json();
        setFormData({
          ...data,
          tags: data.tags?.join(', ') || '',
          images: data.images || [],
          stock: data.stock || 0,
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('error_load_product'));
      }
    }
    fetchProduct();
  }, [productId, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(String(formData.price ?? 0)),
          stock: parseInt(String(formData.stock ?? 0), 10),
          tags: (typeof formData.tags === 'string' ? formData.tags : '')
            .split(',')
            .map((t: string) => t.trim()),
          images:
            typeof formData.images === 'string'
              ? formData.images.split(',').map((i: string) => i.trim())
              : formData.images,
        }),
      });

      if (!res.ok) throw new Error('Erreur modification');
      toast.success(t('product_updated'));
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error((err as Error).message || t('product_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <p className="text-token-text/60 animate-pulse p-4" role="status" aria-live="polite">
        {tCommon('loading')}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-4 bg-white dark:bg-[hsl(var(--surface))] rounded-xl shadow-[var(--shadow-sm)] border border-[hsl(var(--border))]"
      aria-labelledby="edit-product-heading"
    >
      <h2 id="edit-product-heading" className="text-xl font-bold text-[hsl(var(--text))]">
        {t('edit_product')}
      </h2>

      <div>
        <label
          htmlFor="edit-product-title"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_title_label')}
        </label>
        <input
          id="edit-product-title"
          name="title"
          value={String(formData.title ?? '')}
          onChange={handleChange}
          placeholder="Titre"
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-slug"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_slug_label')}
        </label>
        <input
          id="edit-product-slug"
          name="slug"
          value={String(formData.slug ?? '')}
          onChange={handleChange}
          placeholder="Slug (URL)"
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-description"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_description_label')}
        </label>
        <textarea
          id="edit-product-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-price"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_price_label')}
        </label>
        <input
          id="edit-product-price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="Prix (€)"
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-image"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_image_label')}
        </label>
        <input
          id="edit-product-image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="URL image principale"
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-images"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_images_label')}
        </label>
        <input
          id="edit-product-images"
          name="images"
          value={Array.isArray(formData.images) ? formData.images.join(', ') : formData.images}
          onChange={handleChange}
          placeholder={t('edit_product_images_placeholder')}
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-category"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_category_label')}
        </label>
        <input
          id="edit-product-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder={t('edit_product_category_placeholder')}
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-stock"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_stock_label')}
        </label>
        <input
          id="edit-product-stock"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      <div>
        <label
          htmlFor="edit-product-tags"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('edit_product_tags_label')}
        </label>
        <input
          id="edit-product-tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder={t('edit_product_tags_placeholder')}
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-4 py-2 rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 transition"
      >
        {loading ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  );
}
