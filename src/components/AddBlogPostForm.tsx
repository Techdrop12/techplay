'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AddBlogPostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    image: '',
    author: '',
    published: false,
  })
  const [apiError, setApiError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setFieldErrors({})
    if (!form.title.trim()) {
      setFieldErrors({ title: 'Titre requis' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
          image: form.image.trim() || undefined,
          author: form.author.trim() || undefined,
          published: form.published,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data?.error || 'Erreur')
        return
      }
      toast.success('Article créé')
      router.push('/admin/blog')
      router.refresh()
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Erreur création')
    } finally {
      setLoading(false)
    }
  }

  const inputErrorClass = 'border-red-500 dark:border-red-400 focus-visible:ring-red-500'
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl" noValidate aria-labelledby="add-blog-heading">
      <h2 id="add-blog-heading" className="sr-only">Nouvel article</h2>
      {apiError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {apiError}
        </div>
      )}
      <div>
        <label htmlFor="blog-title" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">
          Titre *
        </label>
        <input
          id="blog-title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 ${fieldErrors.title ? inputErrorClass : 'border-[hsl(var(--border))] focus-visible:ring-[hsl(var(--accent))]'}`}
          placeholder="Titre de l'article"
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? 'blog-title-error' : undefined}
        />
        {fieldErrors.title && (
          <p id="blog-title-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.title}</p>
        )}
      </div>
      <div>
        <label htmlFor="blog-slug" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">
          Slug (optionnel, généré depuis le titre si vide)
        </label>
        <input
          id="blog-slug"
          name="slug"
          type="text"
          value={form.slug}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          placeholder="mon-article"
        />
      </div>
      <div>
        <label htmlFor="blog-description" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">
          Description / extrait
        </label>
        <textarea
          id="blog-description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          placeholder="Résumé ou contenu court"
        />
      </div>
      <div>
        <label htmlFor="blog-image" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">
          URL image
        </label>
        <input
          id="blog-image"
          name="image"
          type="url"
          value={form.image}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          placeholder="https://..."
        />
      </div>
      <div>
        <label htmlFor="blog-author" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">
          Auteur
        </label>
        <input
          id="blog-author"
          name="author"
          type="text"
          value={form.author}
          onChange={handleChange}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          placeholder="Nom de l'auteur"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="blog-published"
          name="published"
          type="checkbox"
          checked={form.published}
          onChange={handleChange}
          className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
        />
        <label htmlFor="blog-published" className="text-sm text-[hsl(var(--text))]">
          Publier tout de suite
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? 'Création…' : 'Créer l’article'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
