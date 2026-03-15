import type { Metadata } from 'next'
import Link from 'next/link'

import AdminBlogTable from '@/components/AdminBlogTable'

export const metadata: Metadata = {
  title: 'Blog – Admin TechPlay',
  description: 'Publier, dépublier ou supprimer des articles.',
  robots: { index: false, follow: false },
}

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="admin-blog-title" className="heading-page">
            Articles du blog
          </h1>
          <p className="mt-1 text-[15px] text-token-text/70">
            Publier, dépublier ou supprimer des articles.
          </p>
        </div>
        <Link
          href="/admin/blog/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          + Nouvel article
        </Link>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <AdminBlogTable />
      </div>
    </div>
  )
}
