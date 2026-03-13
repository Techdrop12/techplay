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
      <div className="mx-auto max-w-xl rounded-[1.5rem] border border-white/10 bg-[hsl(var(--surface))]/95 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:bg-[hsl(var(--surface))]/90 sm:p-10">
        <h1
          id="nf-title"
          className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
          404 – Page introuvable
        </h1>

        <p className="mt-4 text-[15px] text-gray-600 dark:text-gray-300">
          Désolé, cette page n&apos;existe pas ou a été déplacée.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-[15px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.4)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
            aria-label="Retour à l'accueil"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

        <Suspense fallback={<p className="mt-10 text-[13px] text-gray-500">Chargement…</p>}>
          <NotFoundClient />
        </Suspense>
      </div>
    </main>
  )
}
