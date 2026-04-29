import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BookOpen, MessageSquare, Package, PlusCircle, ShoppingCart, Star, Upload } from 'lucide-react';

import AdminBlogTable from '@/components/AdminBlogTable';
import AdminReviewTable from '@/components/AdminReviewTable';
import AdminStatsBlock from '@/components/AdminStatsBlock';
import AdminHealthBlock from '@/components/AdminHealthBlock';
import AdminInsightsBlock from '@/components/AdminInsightsBlock';
import AdminSalesChart from '@/components/AdminSalesChart';
import OrderTable from '@/components/OrderTable';
import ProductTable from '@/components/ProductTable';

export const metadata: Metadata = {
  title: 'Dashboard – Admin TechPlay',
  description: "Vue d'ensemble des ventes, avis, commandes et contenus.",
  robots: { index: false, follow: false },
};

type QuickAction = { href: string; label: string; primary?: boolean; icon: React.ReactNode };

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin');

  const quickActions: QuickAction[] = [
    { href: '/admin/produits/nouveau', label: t('quick_product'), primary: true, icon: <PlusCircle size={13} /> },
    { href: '/admin/blog/nouveau', label: t('quick_article'), icon: <BookOpen size={13} /> },
    { href: '/admin/commandes', label: t('quick_orders'), icon: <ShoppingCart size={13} /> },
    { href: '/admin/contact', label: t('quick_messages'), icon: <MessageSquare size={13} /> },
    { href: '/admin/produits?featured=1', label: t('quick_featured'), icon: <Star size={13} /> },
    { href: '/admin/import', label: t('quick_import'), icon: <Upload size={13} /> },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="admin-dashboard-title" className="heading-page mb-1">
            {t('dashboard_title')}
          </h1>
          <p className="text-[13px] text-token-text/70">{t('dashboard_subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label={t('quick_actions')}>
          {quickActions.map(({ href, label, primary, icon }) => (
            <Link
              key={href}
              href={href}
              className={
                primary
                  ? 'inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]'
                  : 'inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-xs font-medium text-token-text/80 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]'
              }
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>
      </header>

      <section aria-labelledby="admin-stats-heading">
        <h2 id="admin-stats-heading" className="sr-only">
          {t('stats_heading')}
        </h2>
        <AdminStatsBlock />
      </section>

      <AdminHealthBlock />

      <section aria-labelledby="admin-chart-heading">
        <h2 id="admin-chart-heading" className="sr-only">Graphique des ventes</h2>
        <AdminSalesChart />
      </section>

      <section aria-labelledby="admin-insights-heading">
        <h2 id="admin-insights-heading" className="sr-only">
          {t('insights_heading')}
        </h2>
        <AdminInsightsBlock />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <section aria-labelledby="admin-products-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="admin-products-heading" className="text-xl font-bold text-[hsl(var(--text))]">
              {t('products_preview')}
            </h2>
            <Link
              href="/admin/produits"
              className="text-xs font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
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
              className="text-xs font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              {t('see_all')}
            </Link>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
            <OrderTable />
          </div>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="admin-blog-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="admin-blog-heading" className="text-xl font-bold text-[hsl(var(--text))]">
              {t('blog_section')}
            </h2>
            <Link
              href="/admin/blog"
              className="text-xs font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
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
              className="text-xs font-medium text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              {t('manage')}
            </Link>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
            <AdminReviewTable />
          </div>
        </section>
      </div>
    </div>
  );
}
