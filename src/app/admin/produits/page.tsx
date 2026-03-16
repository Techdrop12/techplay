import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import ProductTable from '@/components/ProductTable';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return {
    title: `Produits – Admin TechPlay`,
    description: t('products_management_heading'),
    robots: { index: false, follow: false },
  };
}

export default async function AdminProduitsPage() {
  const t = await getTranslations('admin');
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 id="admin-produits-title" className="heading-page">
          {t('products_management_heading')}
        </h1>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          {t('add_product_btn')}
        </Link>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <ProductTable />
      </div>
    </div>
  );
}
