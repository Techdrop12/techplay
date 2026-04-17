'use client';

import { Eye, Pencil, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import TableSkeleton from '@/components/admin/TableSkeleton';

const PAGE_SIZE = 25;

interface ProductRow {
  _id: string;
  title: string;
  price: number;
  stock: number;
  slug: string;
  category?: string;
  published?: boolean;
}

export default function ProductTable() {
  const t = useTranslations('admin');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [noImageOnly, setNoImageOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [isNewOnly, setIsNewOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const router = useRouter();

  const listFiltersRef = useRef({
    searchQuery,
    categoryFilter,
    lowStockOnly,
    noImageOnly,
    featuredOnly,
    isNewOnly,
    bestSellerOnly,
  });
  listFiltersRef.current = {
    searchQuery,
    categoryFilter,
    lowStockOnly,
    noImageOnly,
    featuredOnly,
    isNewOnly,
    bestSellerOnly,
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const f = listFiltersRef.current;
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (f.searchQuery.trim()) params.set('q', f.searchQuery.trim());
    if (f.categoryFilter) params.set('category', f.categoryFilter);
    if (f.lowStockOnly) params.set('lowStock', '1');
    if (f.noImageOnly) params.set('noImage', '1');
    if (f.featuredOnly) params.set('featured', '1');
    if (f.isNewOnly) params.set('isNew', '1');
    if (f.bestSellerOnly) params.set('bestSeller', '1');
    fetch(`/api/admin/products?${params}`)
      .then((res) => res.json())
      .then((data: { items?: ProductRow[]; total?: number; pages?: number }) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setProducts(items);
        setSelectedIds((prev) => {
          if (prev.size === 0) return prev;
          const next = new Set<string>();
          for (const item of items) {
            if (prev.has(item._id)) next.add(item._id);
          }
          return next;
        });
        setTotal(Number(data?.total) ?? 0);
        setPages(Math.max(1, Number(data?.pages) ?? 1));
      })
      .catch(() => toast.error(t('error_load_products')))
      .finally(() => setLoading(false));
  }, [page, t]);

  useEffect(() => { fetchProducts(); }, [fetchProducts, refreshTrigger]);

  useEffect(() => {
    fetch('/api/admin/products/categories')
      .then((res) => res.json())
      .then((data: string[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const applyFilters = () => { setPage(1); setRefreshTrigger((n) => n + 1); };

  const allVisibleSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p._id));
  const someVisibleSelected =
    products.some((p) => selectedIds.has(p._id)) && !allVisibleSelected;
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        products.forEach((p) => next.delete(p._id));
        return next;
      }
      const next = new Set(prev);
      products.forEach((p) => next.add(p._id));
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

  const handleTogglePublished = async (row: ProductRow) => {
    const next = !(row.published ?? true);
    setProducts((prev) => prev.map((p) => (p._id === row._id ? { ...p, published: next } : p)));
    try {
      const res = await fetch(`/api/admin/products/${row._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? t('product_published') : t('product_unpublished'));
    } catch {
      setProducts((prev) => prev.map((p) => (p._id === row._id ? { ...p, published: !next } : p)));
      toast.error(t('inline_error'));
    }
  };

  const handleInlineChange = (id: string, field: 'price' | 'stock', value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? { ...p, [field]: Number.isNaN(Number(value)) ? p[field] : Number(value) }
          : p
      )
    );
  };

  const handleInlineSave = async (row: ProductRow) => {
    setSavingRowId(row._id);
    try {
      const res = await fetch(`/api/admin/products/${row._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: row.price, stock: row.stock }),
      });
      if (!res.ok) throw new Error();
      toast.success(t('inline_updated'));
      fetchProducts();
    } catch {
      toast.error(t('inline_error'));
    } finally {
      setSavingRowId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(t('bulk_confirm_delete', { count: selectedIds.size }))) return;
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error();
        })
      );
      toast.success(t('product_deleted'));
      setSelectedIds(new Set());
      fetchProducts();
    } catch {
      toast.error(t('error_delete'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success(t('product_deleted'));
      fetchProducts();
    } catch {
      toast.error(t('error_delete'));
    }
  };

  if (loading) {
    return <TableSkeleton rows={8} cols={5} ariaLabel={t('loading_products')} />;
  }

  const BADGE_FILTERS = [
    { key: 'lowStock', label: t('filter_low_stock'), value: lowStockOnly, set: setLowStockOnly },
    { key: 'noImage', label: t('filter_no_image'), value: noImageOnly, set: setNoImageOnly },
    { key: 'featured', label: t('filter_featured'), value: featuredOnly, set: setFeaturedOnly },
    { key: 'isNew', label: t('filter_is_new'), value: isNewOnly, set: setIsNewOnly },
    { key: 'bestSeller', label: t('filter_best_seller'), value: bestSellerOnly, set: setBestSellerOnly },
  ] as const;

  return (
    <div className="space-y-3" aria-label={t('products_title')}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-token-text/40" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder={t('search_products_placeholder')}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 pl-8 pr-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            aria-label={t('search_products_aria')}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('filter_category')}
        >
          <option value="">{t('all_categories')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--accent-fg))] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        >
          {t('filter_apply')}
        </button>

        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${
            filtersOpen
              ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-token-text/70 hover:bg-[hsl(var(--surface-2))]'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">{t('advanced_filters_label')}</span>
        </button>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-token-text/60">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded border border-[hsl(var(--border))] px-2 py-1 disabled:opacity-40 hover:bg-[hsl(var(--surface-2))]"
            aria-label={t('pagination_prev')}
          >←</button>
          <span>{t('products_page_info', { page, pages, total })}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pages || loading}
            className="rounded border border-[hsl(var(--border))] px-2 py-1 disabled:opacity-40 hover:bg-[hsl(var(--surface-2))]"
            aria-label={t('pagination_next')}
          >→</button>
        </div>
      </div>

      {/* Advanced filters */}
      {filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2.5">
          {BADGE_FILTERS.map(({ key, label, value, set }) => (
            <label
              key={key}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition select-none ${
                value
                  ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-token-text/70 hover:bg-[hsl(var(--surface))]'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={value}
                onChange={(e) => { set(e.target.checked); }}
              />
              {label}
            </label>
          ))}
          <button
            type="button"
            onClick={applyFilters}
            className="ml-auto rounded-lg bg-[hsl(var(--accent))] px-3 py-1 text-[12px] font-medium text-[hsl(var(--accent-fg))] hover:opacity-90"
          >
            {t('advanced_filters_apply')}
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <span className="font-semibold">{t('bulk_selected', { count: selectedCount })}</span>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-red-400 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-600 hover:text-white dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
          >
            <Trash2 size={11} />
            {t('bulk_delete')}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)]">
        <table className="min-w-full text-sm" aria-label={t('products_title')}>
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
              <th className="w-10 p-3 text-center">
                <input
                  type="checkbox"
                  aria-label={t('bulk_select_all')}
                  checked={allVisibleSelected}
                  ref={(el) => { if (el) el.indeterminate = someVisibleSelected; }}
                  onChange={toggleSelectAllVisible}
                  className="rounded border-[hsl(var(--border))]"
                />
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-token-text/50">{t('table_title')}</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-token-text/50">{t('table_published')}</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-token-text/50">{t('table_price')}</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-token-text/50">{t('table_stock')}</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-token-text/50">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-token-text/50">
                  {t('no_products')}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isPublished = p.published ?? true;
                const isLowStock = p.stock <= 3;
                return (
                  <tr
                    key={p._id}
                    className="group bg-[hsl(var(--surface))] transition-colors hover:bg-[hsl(var(--surface-2))]"
                  >
                    <td className="w-10 p-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={t('bulk_select_one', { title: p.title })}
                        checked={selectedIds.has(p._id)}
                        onChange={() => toggleSelectOne(p._id)}
                        className="rounded border-[hsl(var(--border))]"
                      />
                    </td>

                    {/* Title + category */}
                    <td className="px-3 py-2.5 min-w-[160px]">
                      <p className="font-medium text-[hsl(var(--text))] leading-snug truncate max-w-[220px]">
                        {p.title}
                      </p>
                      {p.category && (
                        <span className="text-[11px] text-token-text/50">{p.category}</span>
                      )}
                    </td>

                    {/* Published toggle */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(p)}
                        aria-label={isPublished ? t('unpublish_aria', { title: p.title }) : t('publish_aria', { title: p.title })}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-700 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-red-900/40 dark:hover:text-red-300'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {isPublished ? t('published') : t('unpublished')}
                      </button>
                    </td>

                    {/* Price inline */}
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                        value={Number.isFinite(p.price) ? p.price : 0}
                        onChange={(e) => handleInlineChange(p._id, 'price', e.target.value)}
                        aria-label={t('inline_price_aria', { title: p.title })}
                      />
                    </td>

                    {/* Stock inline */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          className={`w-20 rounded-lg border px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${
                            isLowStock
                              ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
                              : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))]'
                          }`}
                          value={Number.isFinite(p.stock) ? p.stock : 0}
                          onChange={(e) => handleInlineChange(p._id, 'stock', e.target.value)}
                          aria-label={t('inline_stock_aria', { title: p.title })}
                        />
                        {isLowStock && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            !
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleInlineSave(p)}
                          disabled={savingRowId === p._id}
                          className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2.5 py-1 text-[11px] font-medium text-token-text/70 transition hover:bg-[hsl(var(--surface-2))] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                          aria-label={t('inline_save_aria', { title: p.title })}
                        >
                          {savingRowId === p._id ? t('inline_saving') : t('inline_save')}
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/produit/${p._id}`)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                          aria-label={t('modify')}
                          title={t('modify')}
                        >
                          <Pencil size={12} />
                        </button>
                        {p.slug && (
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-token-text/60 transition hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))]"
                            aria-label={t('view_product_aria', { title: p.title })}
                            title={t('view_product_aria', { title: p.title })}
                          >
                            <Eye size={12} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-token-text/40 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          aria-label={t('delete')}
                          title={t('delete')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
