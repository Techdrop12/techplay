'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import Link from '@/components/LocalizedLink';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string | Date;
}

type StatusFilter = 'all' | 'published' | 'draft';

export default function AdminBlogTable() {
  const t = useTranslations('admin');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    let list =
      statusFilter === 'all'
        ? posts
        : statusFilter === 'published'
          ? posts.filter((p) => p.published)
          : posts.filter((p) => !p.published);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, statusFilter, searchQuery]);

  const allVisibleSelected =
    filteredPosts.length > 0 &&
    filteredPosts.every((p) => selectedIds.has(p._id));

  const someVisibleSelected =
    filteredPosts.some((p) => selectedIds.has(p._id)) && !allVisibleSelected;

  const selectedCount = selectedIds.size;

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then((data: unknown) => setPosts(Array.isArray(data) ? (data as BlogPost[]) : []))
      .catch(() => {
        toast.error(t('error_load_articles'));
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [t]);

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filteredPosts.forEach((p) => next.delete(p._id));
        return next;
      }
      const next = new Set(prev);
      filteredPosts.forEach((p) => next.add(p._id));
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePublish = async (id: string) => {
    const res = await fetch(`/api/blog/toggle-publish?id=${id}`, { method: 'POST' });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, published: !p.published } : p)));
      toast.success(t('status_updated'));
    } else {
      toast.error(t('error_publish'));
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm(t('confirm_delete_article'))) return;
    const res = await fetch(`/api/blog/delete?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success(t('article_deleted'));
    } else {
      toast.error(t('error_delete_article'));
    }
  };

  const bulkPublish = async (publish: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(`/api/blog/toggle-publish?id=${id}`, { method: 'POST' });
        if (!res.ok) throw new Error();
      }
      setPosts((prev) =>
        prev.map((p) =>
          selectedIds.has(p._id) ? { ...p, published: publish } : p
        )
      );
      setSelectedIds(new Set());
      toast.success(t('blog_bulk_status_updated'));
    } catch {
      toast.error(t('error_publish'));
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(t('blog_bulk_confirm_delete', { count: selectedIds.size }))) return;
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(`/api/blog/delete?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      }
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p._id)));
      setSelectedIds(new Set());
      toast.success(t('blog_bulk_deleted'));
    } catch {
      toast.error(t('error_delete_article'));
    }
  };

  if (loading) {
    return (
      <p className="text-token-text/60 animate-pulse p-4" role="status" aria-live="polite">
        {t('loading_articles')}
      </p>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="text-xl font-bold text-[hsl(var(--text))]">📝 {t('articles_title')}</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('filter_status_blog')}
        >
          <option value="all">{t('all')}</option>
          <option value="published">{t('published')}</option>
          <option value="draft">{t('draft')}</option>
        </select>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('blog_search_placeholder')}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        />
      </div>
      {selectedCount > 0 && (
        <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-1.5 text-xs text-token-text/80">
          <span>
            {t('blog_bulk_selected', { count: selectedCount })}
          </span>
          <button
            type="button"
            onClick={() => bulkPublish(true)}
            className="rounded-md border border-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white"
          >
            {t('blog_bulk_publish')}
          </button>
          <button
            type="button"
            onClick={() => bulkPublish(false)}
            className="rounded-md border border-amber-500 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-600 hover:text-white"
          >
            {t('blog_bulk_unpublish')}
          </button>
          <button
            type="button"
            onClick={bulkDelete}
            className="rounded-md border border-red-500 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-600 hover:text-white"
          >
            {t('blog_bulk_delete')}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse" aria-label={t('articles_title')}>
          <thead>
            <tr className="bg-[hsl(var(--surface-2))] text-left">
              <th className="px-2 py-2 w-8 text-center">
                <input
                  type="checkbox"
                  aria-label={t('blog_bulk_select_all')}
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisibleSelected;
                  }}
                  onChange={toggleSelectAllVisible}
                />
              </th>
              <th className="px-4 py-2">{t('table_title')}</th>
              <th className="px-4 py-2 text-center">{t('table_status')}</th>
              <th className="px-4 py-2 text-center">{t('table_date')}</th>
              <th className="px-4 py-2 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr
                key={post._id}
                className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors"
              >
                <td className="px-2 py-2 text-center align-middle">
                  <input
                    type="checkbox"
                    aria-label={t('blog_bulk_select_one', { title: post.title })}
                    checked={selectedIds.has(post._id)}
                    onChange={() => toggleSelectOne(post._id)}
                  />
                </td>
                <td className="px-4 py-2">{post.title}</td>
                <td className="px-4 py-2 text-center">
                  {post.published ? `✅ ${t('published')}` : `❌ ${t('draft')}`}
                </td>
                <td className="px-4 py-2 text-center">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 space-x-2 text-center">
                  <Link
                    href={`/admin/blog/${post._id}`}
                    className="text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded"
                  >
                    {t('modify')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => togglePublish(post._id)}
                    className="text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded"
                  >
                    {post.published ? t('unpublish') : t('publish')}
                  </button>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-yellow-600 dark:text-yellow-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('view_article')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => deletePost(post._id)}
                    className="text-red-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded"
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-token-text/50">
                  {posts.length === 0 ? t('no_articles') : t('no_articles_filter')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
