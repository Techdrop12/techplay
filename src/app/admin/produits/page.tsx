import type { Metadata } from 'next'
import Link from 'next/link'

import ProductTable from '@/components/ProductTable'

export const metadata: Metadata = {
  title: 'Produits – Admin TechPlay',
  description: 'Gestion des produits du catalogue.',
  robots: { index: false, follow: false },
}

export default function AdminProduitsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 id="admin-produits-title" className="heading-page">
          Gestion des produits
        </h1>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          + Ajouter un produit
        </Link>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <ProductTable />
      </div>
    </div>
  )
}
