import type { Metadata } from 'next'
import Link from 'next/link'

import EditProductForm from '@/components/EditProductForm'

export const metadata: Metadata = {
  title: 'Modifier le produit – Admin TechPlay',
  robots: { index: false, follow: false },
}

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/produits"
          className="text-token-text/70 hover:text-[hsl(var(--text))] text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          ← Retour aux produits
        </Link>
      </header>
      <EditProductForm productId={id} />
    </div>
  )
}
