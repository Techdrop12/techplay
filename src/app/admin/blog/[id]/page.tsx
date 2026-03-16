import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import EditBlogPostForm from '@/components/EditBlogPostForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return {
    title: `${t('edit_article_heading')} – Admin TechPlay`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('admin');
  const { id } = await params;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="text-token-text/70 hover:text-[hsl(var(--text))] text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          {t('back_to_articles')}
        </Link>
      </header>
      <h1 id="admin-blog-edit-title" className="heading-page">
        {t('edit_article_heading')}
      </h1>
      <EditBlogPostForm postId={id} />
    </div>
  );
}
