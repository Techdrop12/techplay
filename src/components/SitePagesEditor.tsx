'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface SlugConfig {
  slug: string
  label: string
}

interface SitePageDoc {
  slug: string
  title: string
  content: string
}

export default function SitePagesEditor({ slugs }: { slugs: readonly SlugConfig[] }) {
  const t = useTranslations('admin')
  const [selected, setSelected] = useState(slugs[0]?.slug ?? '')
  const [_page, setPage] = useState<SitePageDoc | null>(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchPage = useCallback(async (slug: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/site-pages?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (res.status === 404) {
        setPage(null)
        const label = slugs.find((s) => s.slug === slug)?.label ?? slug
        setForm({ title: label, content: '' })
      } else if (res.ok) {
        setPage(data)
        setForm({ title: data.title ?? '', content: data.content ?? '' })
      }
    } catch {
      toast.error(t('pages_error_load'))
    } finally {
      setLoading(false)
    }
  }, [slugs, t])

  useEffect(() => {
    if (selected) fetchPage(selected)
  }, [selected, fetchPage])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selected, title: form.title, content: form.content }),
      })
      if (!res.ok) throw new Error('Erreur')
      toast.success(t('pages_saved'))
      setPage(await res.json())
    } catch {
      toast.error(t('pages_error_save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <nav className="border-b sm:border-b-0 sm:border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-2">
          {slugs.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              onClick={() => setSelected(slug)}
              className={`block w-full sm:w-48 text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                selected === slug
                  ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]'
                  : 'hover:bg-[hsl(var(--surface))] text-token-text/80'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex-1 p-6">
          {loading ? (
            <p className="text-token-text/60 animate-pulse" role="status">{t('pages_loading')}</p>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="site-page-title" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">{t('pages_label_title')}</label>
                <input
                  id="site-page-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="site-page-content" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">{t('pages_label_content')}</label>
                <textarea
                  id="site-page-content"
                  rows={14}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                  placeholder="<p>Votre contenu…</p> ou texte simple"
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                aria-busy={saving}
                className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60"
              >
                {saving ? t('pages_saving') : t('pages_save')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
