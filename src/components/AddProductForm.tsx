'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const FIELDS = [
  { name: 'title', labelKey: 'table_title', type: 'text' as const },
  { name: 'slug', labelKey: 'table_slug', type: 'text' as const },
  { name: 'description', labelKey: 'description', type: 'textarea' as const },
  { name: 'price', labelKey: 'table_price', type: 'number' as const },
  { name: 'image', labelKey: 'image_main', type: 'text' as const },
  { name: 'images', labelKey: 'images_extra', type: 'text' as const },
  { name: 'category', labelKey: 'category', type: 'text' as const },
  { name: 'stock', labelKey: 'table_stock', type: 'number' as const },
  { name: 'tags', labelKey: 'tags_label', type: 'text' as const },
];

export default function AddProductForm() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
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

      const data = await res.json();
      if (!res.ok) {
        setApiError(data?.error ?? data?.message ?? t('product_created_error'));
        return;
      }

      toast.success(t('product_added'));
      router.push('/admin/dashboard');
    } catch (err) {
      setApiError((err as Error).message || t('product_error'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] text-[hsl(var(--text))]';

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] shadow-[var(--shadow-md)] space-y-4"
      aria-labelledby="add-product-heading"
      noValidate
    >
      <h2
        id="add-product-heading"
        className="text-2xl font-semibold text-center text-[hsl(var(--text))]"
      >
        {t('add_product_heading')}
      </h2>

      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
        >
          {apiError}
        </div>
      )}

      {FIELDS.map(({ name, labelKey, type }) => (
        <div key={name}>
          <label
            htmlFor={`add-product-${name}`}
            className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
          >
            {t(labelKey)}
          </label>
          {type === 'textarea' ? (
            <textarea
              id={`add-product-${name}`}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required={['title', 'slug', 'description', 'price', 'image'].includes(name)}
              className={`${inputClass} resize-none`}
              placeholder={name === 'description' ? 'Description du produit' : undefined}
            />
          ) : (
            <input
              id={`add-product-${name}`}
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required={['title', 'slug', 'description', 'price', 'image'].includes(name)}
              className={inputClass}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] py-2 px-4 rounded-lg hover:opacity-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60"
      >
        {loading ? tCommon('saving') : t('add_product_submit')}
      </button>
    </form>
  );
}
