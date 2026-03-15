import type { Metadata } from 'next'

import SitePagesEditor from '@/components/SitePagesEditor'

export const metadata: Metadata = {
  title: 'Pages légales – Admin TechPlay',
  robots: { index: false, follow: false },
}

const LEGAL_SLUGS = [
  { slug: 'cgv', label: 'Conditions générales de vente' },
  { slug: 'mentions-legales', label: 'Mentions légales' },
  { slug: 'confidentialite', label: 'Politique de confidentialité' },
] as const

export default function AdminPagesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 id="admin-pages-title" className="heading-page">
          Pages légales
        </h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Modifier le contenu des pages CGV, mentions légales et confidentialité.
        </p>
      </header>
      <SitePagesEditor slugs={LEGAL_SLUGS} />
    </div>
  )
}
