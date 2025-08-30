'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log côté client pour debugging
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-bold">Oups, une erreur est survenue.</h1>
      <p className="mt-2 text-sm text-token-text/70">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : 'La page a rencontré un problème pendant le chargement.'}
      </p>
      {error.digest ? (
        <p className="mt-1 text-xs text-token-text/60">
          Digest: <code>{error.digest}</code>
        </p>
      ) : null}
      <button
        className="mt-4 rounded-lg border border-token-border px-4 py-2 text-sm"
        onClick={() => reset()}
      >
        Recharger
      </button>
    </div>
  )
}
