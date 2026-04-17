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
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  promo?: {
    price?: string | number;
    startDate?: string;
    endDate?: string;
  };
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
          featured: Boolean(data.featured),
          isNew: Boolean(data.isNew),
          isBestSeller: Boolean(data.isBestSeller),
          promo: {
            price: data.promo?.price ?? '',
            startDate: data.promo?.startDate
              ? new Date(data.promo.startDate).toISOString().slice(0, 10)
              : '',
            endDate: data.promo?.endDate
              ? new Date(data.promo.endDate).toISOString().slice(0, 10)
              : '',
          },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('error_load_product'));
      }
    }
    fetchProduct();
  }, [productId, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => (prev ? { ...prev, [name]: nextValue } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);
    try {
      const promoPrice = parseFloat(String(formData.promo?.price ?? ''));
      const promo =
        !isNaN(promoPrice) && promoPrice > 0
          ? {
              price: promoPrice,
              startDate: formData.promo?.startDate || undefined,
              endDate: formData.promo?.endDate || undefined,
            }
          : undefined;

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(String(formData.price ?? 0)),
          stock: parseInt(String(formData.stock ?? 0), 10),
          tags: (typeof formData.tags === 'string' ? formData.tags : '')
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean),
          images:
            typeof formData.images === 'string'
              ? formData.images.split(',').map((i: string) => i.trim())
              : formData.images,
          promo,
        }),
      });

      if (!res.ok) throw new Error('Erreur modification');
      toast.success(t('product_updated'));
      router.push('/admin/produits');
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
      className="space-y-5 max-w-2xl mx-auto p-5 bg-[hsl(var(--surface))] rounded-2xl shadow-[var(--shadow-sm)] border border-[hsl(var(--border))]"
      aria-labelledby="edit-product-heading"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-token-text/60">
            {t('edit_product_heading')}
          </p>
          <h2 id="edit-product-heading" className="text-xl font-bold text-[hsl(var(--text))]">
            {t('edit_product')}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/produits')}
            className="btn-outline rounded-xl px-3 py-1.5 text-[12px] font-medium"
          >
            {tCommon('back') ?? 'Retour à la liste'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline rounded-xl px-3 py-1.5 text-[12px] font-medium"
          >
            {tCommon('cancel') ?? 'Annuler'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary rounded-xl px-4 py-2 text-[14px] font-semibold shadow-soft disabled:opacity-60"
          >
            {loading ? tCommon('saving') : tCommon('save')}
          </button>
        </div>
      </header>

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
      <div className="grid gap-3 sm:grid-cols-2">
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
      <div className="grid gap-3 sm:grid-cols-3">
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
            htmlFor="edit-product-oldPrice"
            className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
          >
            {t('edit_product_old_price_label') ?? 'Ancien prix'}
          </label>
          <input
            id="edit-product-oldPrice"
            name="oldPrice"
            type="number"
            step="0.01"
            value={formData.oldPrice ?? ''}
            onChange={handleChange}
            placeholder="Ancien prix (promo)"
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

      <div className="flex flex-wrap gap-4 border-t border-[hsl(var(--border))]/70 pt-4">
        <label className="inline-flex items-center gap-2 text-sm text-token-text/80">
          <input
            type="checkbox"
            name="featured"
            checked={Boolean(formData.featured)}
            onChange={handleChange}
            className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))]"
          />
          <span>{t('edit_product_featured_label') ?? 'Mettre en avant'}</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-token-text/80">
          <input
            type="checkbox"
            name="isNew"
            checked={Boolean(formData.isNew)}
            onChange={handleChange}
            className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))]"
          />
          <span>{t('edit_product_is_new_label') ?? 'Nouveau'}</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-token-text/80">
          <input
            type="checkbox"
            name="isBestSeller"
            checked={Boolean(formData.isBestSeller)}
            onChange={handleChange}
            className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))]"
          />
          <span>{t('edit_product_is_best_seller_label') ?? 'Best-seller'}</span>
        </label>
      </div>

      <fieldset className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-token-text/60">
          {t('edit_product_promo_legend')}
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="promo-price"
              className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
            >
              {t('edit_product_promo_price')}
            </label>
            <input
              id="promo-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.promo?.price ?? ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, promo: { ...prev.promo, price: e.target.value } } : null
                )
              }
              placeholder="—"
              className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            />
          </div>
          <div>
            <label
              htmlFor="promo-start"
              className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
            >
              {t('edit_product_promo_start')}
            </label>
            <input
              id="promo-start"
              type="date"
              value={formData.promo?.startDate ?? ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, promo: { ...prev.promo, startDate: e.target.value } } : null
                )
              }
              className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            />
          </div>
          <div>
            <label
              htmlFor="promo-end"
              className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
            >
              {t('edit_product_promo_end')}
            </label>
            <input
              id="promo-end"
              type="date"
              value={formData.promo?.endDate ?? ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, promo: { ...prev.promo, endDate: e.target.value } } : null
                )
              }
              className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            />
          </div>
        </div>
        <p className="text-[11px] text-token-text/50">
          {t('edit_product_promo_hint')}
        </p>
      </fieldset>
    </form>
  );
}
