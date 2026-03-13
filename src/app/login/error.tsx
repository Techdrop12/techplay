'use client'

import { useEffect } from 'react'

import Link from '@/components/LocalizedLink'

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Login error:', error)
  }, [error])

  return (
    <main className="mx-auto max-w-md px-4 py-10" role="main" aria-labelledby="login-error-title">
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/20 sm:p-8">
        <h1 id="login-error-title" className="text-xl font-extrabold text-red-800 dark:text-red-300">
          Erreur de connexion
        </h1>
        <p className="mt-2 text-[15px] text-red-700 dark:text-red-400">
          Une erreur est survenue. Vous pouvez réessayer ou retourner à l&apos;accueil.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[15px] font-medium transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
