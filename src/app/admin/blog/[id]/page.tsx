import type { Metadata } from 'next'
import Link from 'next/link'

import EditBlogPostForm from '@/components/EditBlogPostForm'

export const metadata: Metadata = {
  title: 'Modifier l\'article – Admin TechPlay',
  robots: { index: false, follow: false },
}

export default async function AdminEditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="text-token-text/70 hover:text-[hsl(var(--text))] text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          ← Retour aux articles
        </Link>
      </header>
      <h1 id="admin-blog-edit-title" className="heading-page">
        Modifier l’article
      </h1>
      <EditBlogPostForm postId={id} />
    </div>
  )
}
