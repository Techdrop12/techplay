// src/app/not-found.tsx
import { Suspense } from 'react'

import Link from '@/components/LocalizedLink'
import NotFoundClient from '@/components/NotFound'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Page introuvable – TechPlay',
  description: 'La page demandée n\'existe pas ou a été déplacée.',
  robots: { index: false, follow: true },
}

export default function NotFoundPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-5xl px-4 pt-32 pb-24 text-center"
      aria-labelledby="nf-title"
      role="main"
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-lg)]">
        <h1
          id="nf-title"
          className="heading-page sm:text-4xl"
        >
          404 – Page introuvable
        </h1>

        <p className="mt-4 text-[15px] text-gray-600 dark:text-gray-300">
          Désolé, cette page n&apos;existe pas ou a été déplacée.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-lg)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
            aria-label="Retour à l'accueil"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

        <Suspense fallback={<p className="mt-10 text-[13px] text-token-text/60">Chargement…</p>}>
          <NotFoundClient />
        </Suspense>
      </div>
    </main>
  )
}
