'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import TableSkeleton from '@/components/admin/TableSkeleton'

const PAGE_SIZE = 25

interface ProductRow {
  _id: string;
  title: string;
  price: number;
  stock: number;
  slug: string;
  category?: string;
}

export default function ProductTable() {
  const t = useTranslations('admin')
  const [products, setProducts] = useState<ProductRow[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (categoryFilter) params.set('category', categoryFilter)
    fetch(`/api/admin/products?${params}`)
      .then((res) => res.json())
      .then((data: { items?: ProductRow[]; total?: number; pages?: number }) => {
        setProducts(Array.isArray(data?.items) ? data.items : [])
        setTotal(Number(data?.total) ?? 0)
        setPages(Math.max(1, Number(data?.pages) ?? 1))
      })
      .catch(() => toast.error(t('error_load_products')))
      .finally(() => setLoading(false))
  }, [page, searchQuery, categoryFilter, t])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts, refreshTrigger])

  const applyFilters = () => {
    setPage(1)
    setRefreshTrigger((t) => t + 1)
  }

  useEffect(() => {
    fetch('/api/admin/products/categories')
      .then((res) => res.json())
      .then((data: string[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filteredProducts = products

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setProducts((prev) => prev.filter((p) => p._id !== id))
      toast.success(t('product_deleted'))
      fetchProducts()
    } catch {
      toast.error(t('error_delete'))
    }
  }

  if (loading) {
    return <TableSkeleton rows={8} cols={5} ariaLabel={t('loading_products')} />
  }

  return (
    <div className="overflow-x-auto p-4" aria-label={t('products_title')}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">📦 {t('products_title')}</h2>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder={t('search_products_placeholder')}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('search_products_aria')}
        />
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
          className="rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--accent-fg))] hover:opacity-95"
        >
          {t('filter_apply')}
        </button>
        <span className="text-sm text-token-text/70">
          {t('products_page_info', { page, pages, total })}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
          className="rounded-lg border border-[hsl(var(--border))] px-2 py-1.5 text-sm disabled:opacity-50"
          aria-label={t('pagination_prev')}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= pages || loading}
          className="rounded-lg border border-[hsl(var(--border))] px-2 py-1.5 text-sm disabled:opacity-50"
          aria-label={t('pagination_next')}
        >
          →
        </button>
      </div>
      <table className="min-w-full text-sm bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-[var(--shadow-sm)]" aria-label={t('products_title')}>
        <thead>
          <tr className="bg-[hsl(var(--surface-2))] text-left">
            <th className="p-2 border">{t('table_title')}</th>
            <th className="p-2 border">{t('table_price')}</th>
            <th className="p-2 border">{t('table_stock')}</th>
            <th className="p-2 border">{t('table_slug')}</th>
            <th className="p-2 border text-center">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-token-text/60">
                {loading ? t('loading_products') : t('no_products')}
              </td>
            </tr>
          ) : (
            filteredProducts.map((p) => (
              <tr key={p._id} className="hover:bg-[hsl(var(--surface-2))] border-t border-[hsl(var(--border))]">
                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">{p.price.toFixed(2)} €</td>
                <td className="p-2 border">{p.stock}</td>
                <td className="p-2 border">{p.slug}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/produit/${p._id}`)}
                    className="bg-[hsl(var(--accent))] hover:opacity-95 text-[hsl(var(--accent-fg))] px-3 py-1 rounded transition"
                    aria-label={t('modify')}
                  >
                    {t('modify')}
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                    aria-label={t('delete')}
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
