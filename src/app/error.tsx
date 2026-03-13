'use client'

import { useEffect } from 'react'

import Link from '@/components/LocalizedLink'
import { getErrorMessage } from '@/lib/errors'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[RootError]', error)
    }
  }, [error])

  const message = getErrorMessage(error)

  return (
    <main
      id="main"
      className="container-app mx-auto max-w-xl px-4 py-20 text-center"
      role="main"
      aria-labelledby="error-title"
    >
      <div className="card p-8 shadow-[var(--shadow-lg)]">
        <h1 id="error-title" className="text-xl font-bold text-token-text sm:text-2xl [letter-spacing:var(--heading-tracking)]">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-[13px] text-token-text/70">{message}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-premium inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
          >
            Réessayer
          </button>
          <Link href="/" className="btn-outline inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2" prefetch={false}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
