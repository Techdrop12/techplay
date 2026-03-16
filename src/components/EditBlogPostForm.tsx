'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface EditBlogPostFormProps {
  postId: string;
}

export default function EditBlogPostForm({ postId }: EditBlogPostFormProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    image: '',
    author: '',
    published: false,
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.error) throw new Error(data.error);
        setForm({
          title: data.title ?? '',
          slug: data.slug ?? '',
          description: data.description ?? '',
          image: data.image ?? '',
          author: data.author ?? '',
          published: Boolean(data.published),
        });
      })
      .catch((e) => {
        if (!cancelled) toast.error(e?.message || t('loading_error'));
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setFieldErrors({});
    if (!form.title.trim()) {
      setFieldErrors({ title: t('title_required') });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
          image: form.image.trim() || undefined,
          author: form.author.trim() || undefined,
          published: form.published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data?.error || 'Erreur');
        return;
      }
      toast.success(t('article_updated'));
      router.push('/admin/blog');
      router.refresh();
    } catch (e) {
      setApiError(e instanceof Error ? e.message : t('update_error'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div
        className="max-w-xl animate-pulse space-y-4"
        role="status"
        aria-label={t('loading_article_aria')}
      >
        <div className="h-10 rounded-lg bg-[hsl(var(--border))]" />
        <div className="h-10 rounded-lg bg-[hsl(var(--border))]" />
        <div className="h-24 rounded-lg bg-[hsl(var(--border))]" />
      </div>
    );
  }

  const inputErrorClass = 'border-red-500 dark:border-red-400 focus-visible:ring-red-500';
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl"
      noValidate
      aria-labelledby="edit-blog-heading"
    >
      <h2 id="edit-blog-heading" className="sr-only">
        {t('edit_article_sr')}
      </h2>
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
        >
          {apiError}
        </div>
      )}
      <div>
        <label
          htmlFor="edit-blog-title"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          Titre *
        </label>
        <input
          id="edit-blog-title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 ${fieldErrors.title ? inputErrorClass : 'border-[hsl(var(--border))] focus-visible:ring-[hsl(var(--accent))]'}`}
          placeholder="Titre de l'article"
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? 'edit-blog-title-error' : undefined}
        />
        {fieldErrors.title && (
          <p
            id="edit-blog-title-error"
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {fieldErrors.title}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="edit-blog-slug"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          Slug
        </label>
        <input
          id="edit-blog-slug"
          name="slug"
          type="text"
          value={form.slug}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          placeholder="mon-article"
        />
      </div>
      <div>
        <label
          htmlFor="edit-blog-description"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          Description / extrait
        </label>
        <textarea
          id="edit-blog-description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      <div>
        <label
          htmlFor="edit-blog-image"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          URL image
        </label>
        <input
          id="edit-blog-image"
          name="image"
          type="url"
          value={form.image}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      <div>
        <label
          htmlFor="edit-blog-author"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          Auteur
        </label>
        <input
          id="edit-blog-author"
          name="author"
          type="text"
          value={form.author}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="edit-blog-published"
          name="published"
          type="checkbox"
          checked={form.published}
          onChange={handleChange}
          className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
        />
        <label htmlFor="edit-blog-published" className="text-sm text-[hsl(var(--text))]">
          Publié
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? t('saving_btn') : t('save_btn')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          {t('cancel_btn')}
        </button>
      </div>
    </form>
  );
}
