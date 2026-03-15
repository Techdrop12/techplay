import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import AddProductForm from '@/components/AddProductForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return {
    title: `${t('add_product_heading')} – Admin TechPlay`,
    robots: { index: false, follow: false },
  }
}

export default async function AdminNouveauProduitPage() {
  const t = await getTranslations('admin')
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/produits"
          className="text-token-text/70 hover:text-[hsl(var(--text))] text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          {t('back_to_products')}
        </Link>
      </header>
      <h1 id="admin-nouveau-produit-title" className="heading-page">
        {t('add_product_heading')}
      </h1>
      <AddProductForm />
    </div>
  )
}
