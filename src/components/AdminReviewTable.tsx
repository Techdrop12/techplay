'use client'

import { motion } from 'framer-motion'
import { Star, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import TableSkeleton from '@/components/admin/TableSkeleton'

const PAGE_SIZE = 20

interface ReviewRow {
  _id: string
  name?: string
  rating: number
  comment?: string
  productId?: string
  createdAt?: string
}

export default function AdminReviewTable() {
  const t = useTranslations('admin')
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(false)
  const [ratingFilter, setRatingFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
      if (ratingFilter !== '') params.set('rating', String(ratingFilter))
      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? t('error_load_reviews'))
        setReviews([])
        return
      }
      setReviews(Array.isArray(data?.items) ? data.items : [])
      setTotal(Number(data?.total) ?? 0)
      setPages(Math.max(1, Number(data?.pages) ?? 1))
    } catch {
      toast.error(t('error_load_reviews'))
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [page, ratingFilter, t])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete_review'))) return
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('review_deleted'))
        setReviews((prev) => prev.filter((r) => r._id !== id))
        setTotal((prev) => Math.max(0, prev - 1))
      } else {
        throw new Error()
      }
    } catch {
      toast.error(t('delete_failed'))
    }
  }

  const tPagination = useTranslations('pagination')

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-[var(--shadow-sm)] border border-[hsl(var(--border))]">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-[hsl(var(--text))]">📝 {t('reviews_title')}</h2>
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value === '' ? '' : Number(e.target.value))
            setPage(1)
          }}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('all_ratings')}
        >
          <option value="">{t('all_ratings')}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} {n > 1 ? t('stars') : t('star_one')}</option>
          ))}
        </select>
        {!loading && total > 0 && (
          <>
            <span className="text-sm text-token-text/70">
              {t('reviews_page_info', { page, pages, total })}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1.5 text-sm disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              aria-label={tPagination('prev')}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pages || loading}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1.5 text-sm disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              aria-label={tPagination('next')}
            >
              →
            </button>
          </>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} ariaLabel={t('loading_reviews')} />
      ) : reviews.length === 0 ? (
        <p className="text-token-text/50">{ratingFilter !== '' ? t('no_reviews_filter') : t('no_reviews')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-[hsl(var(--border))] rounded-lg overflow-hidden" aria-label={t('reviews_title')}>
            <thead className="bg-[hsl(var(--surface-2))]">
              <tr>
                <th className="text-left px-4 py-2">{t('review_name')}</th>
                <th className="text-left px-4 py-2">{t('review_rating')}</th>
                <th className="text-left px-4 py-2">{t('review_comment')}</th>
                <th className="text-left px-4 py-2">{t('review_product')}</th>
                <th className="text-left px-4 py-2">{t('review_date')}</th>
                <th className="text-center px-4 py-2">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <motion.tr
                  key={r._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors"
                >
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1" role="img" aria-label={`${r.rating} sur 5`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i <= r.rating ? 'text-yellow-400' : 'text-token-text/30'}
                          fill={i <= r.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 max-w-xs break-words">{r.comment}</td>
                  <td className="px-4 py-2 text-xs text-token-text/70">{r.productId}</td>
                  <td className="px-4 py-2 text-xs text-token-text/50">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:text-red-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded p-1"
                      title={t('delete')}
                      aria-label={t('delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
