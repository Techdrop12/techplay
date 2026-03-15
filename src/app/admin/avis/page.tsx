import type { Metadata } from 'next'

import AdminReviewTable from '@/components/AdminReviewTable'

export const metadata: Metadata = {
  title: 'Avis clients – Admin TechPlay',
  description: 'Consulter et modérer les avis laissés sur les produits.',
  robots: { index: false, follow: false },
}

export default function AdminAvisPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 id="admin-avis-title" className="heading-page">
          Avis clients
        </h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Consulter et modérer les avis laissés sur les produits.
        </p>
      </header>
      <AdminReviewTable />
    </div>
  )
}
