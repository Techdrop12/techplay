// src/app/not-found.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import NotFoundClient from '@/components/NotFound'

// SEO minimal & noindex pour 404
export const metadata: Metadata = {
  title: '404 – Page introuvable | TechPlay',
  description:
    "Désolé, cette page n'existe pas ou a été déplacée. Retrouvez nos catégories ou retournez à l'accueil.",
  robots: { index: false, follow: false },
  openGraph: {
    title: '404 – Page introuvable | TechPlay',
    description:
      "Cette page n'existe pas. Recherchez un produit ou revenez à l'accueil.",
    type: 'website',
  },
}

// ✅ Empêche le prerender strict de la route /_not-found => plus de bailouts
export const dynamic = 'force-dynamic'

export default function NotFoundPage() {
  // On rend *uniquement* le composant client sous <Suspense>,
  // ainsi tous les hooks de navigation (useSearchParams, usePathname...) sont couverts.
  return (
    <Suspense
      fallback={
        <main
          id="main"
          className="max-w-5xl mx-auto px-4 pt-32 pb-24 text-center"
          role="main"
          aria-busy="true"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light">
            404 – Page introuvable
          </h1>
          <p className="mt-4 text-muted-foreground">Chargement…</p>
        </main>
      }
    >
      <NotFoundClient />
    </Suspense>
  )
}
