import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import AdminBlogTable from '@/components/AdminBlogTable'
import AdminReviewTable from '@/components/AdminReviewTable'
import AdminStatsBlock from '@/components/AdminStatsBlock'
import OrderTable from '@/components/OrderTable'
import ProductTable from '@/components/ProductTable'

export const metadata: Metadata = {
  title: 'Dashboard – Admin TechPlay',
  description: 'Vue d\'ensemble des ventes, avis, commandes et contenus.',
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin')
  return (
    <div className="space-y-8">
      <header>
        <h1 id="admin-dashboard-title" className="heading-page mb-2">
          {t('dashboard_title')}
        </h1>
        <p className="text-[15px] text-token-text/70">
          {t('dashboard_subtitle')}
        </p>
      </header>

      <section aria-labelledby="admin-quick-actions-heading" className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
        <h2 id="admin-quick-actions-heading" className="text-sm font-semibold uppercase tracking-wider text-token-text/60 mb-3">
          {t('quick_actions')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/produits/nouveau"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--accent))] px-3 py-2 text-sm font-medium text-[hsl(var(--accent-fg))] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('quick_product')}
          </Link>
          <Link
            href="/admin/blog/nouveau"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('quick_article')}
          </Link>
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('quick_orders')}
          </Link>
          <Link
            href="/admin/contact"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('quick_messages')}
          </Link>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('quick_legal')}
          </Link>
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            {t('quick_import')}
          </Link>
        </div>
      </section>

      <section aria-labelledby="admin-stats-heading">
        <h2 id="admin-stats-heading" className="sr-only">
          {t('stats_heading')}
        </h2>
        <AdminStatsBlock />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="admin-products-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="admin-products-heading" className="text-xl font-bold text-[hsl(var(--text))]">
              {t('products_preview')}
            </h2>
            <Link
              href="/admin/produits"
              className="text-sm font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              {t('see_all')}
            </Link>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
            <ProductTable />
          </div>
        </section>

        <section aria-labelledby="admin-orders-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="admin-orders-heading" className="text-xl font-bold text-[hsl(var(--text))]">
              {t('orders_title')}
            </h2>
            <Link
              href="/admin/commandes"
              className="text-sm font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              {t('see_all')}
            </Link>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
            <OrderTable />
          </div>
        </section>
      </div>

      <section aria-labelledby="admin-blog-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="admin-blog-heading" className="text-xl font-bold text-[hsl(var(--text))]">
            {t('blog_section')}
          </h2>
          <Link
            href="/admin/blog"
            className="text-sm font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('manage')}
          </Link>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
          <AdminBlogTable />
        </div>
      </section>

      <section aria-labelledby="admin-reviews-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="admin-reviews-heading" className="text-xl font-bold text-[hsl(var(--text))]">
            {t('reviews_section')}
          </h2>
          <Link
            href="/admin/avis"
            className="text-sm font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('manage')}
          </Link>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
          <AdminReviewTable />
        </div>
      </section>
    </div>
  )
}
