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
      className="container-app mx-auto max-w-2xl px-4 py-16 text-center"
      role="main"
      aria-labelledby="error-title"
    >
      <h1 id="error-title" className="text-2xl font-bold text-token-text">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm text-token-text/70">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-primary inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-2.5"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="btn btn-outline inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-2.5"
          prefetch={false}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
