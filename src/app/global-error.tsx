'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)
  return (
    <html>
      <body>
        <div className="mx-auto max-w-xl p-6">
          <h1 className="text-xl font-bold">Erreur globale</h1>
          <p className="mt-2 text-sm">Un problème est survenu pendant le rendu.</p>
          {error.digest ? <p className="mt-1 text-xs">Digest: <code>{error.digest}</code></p> : null}
          <button className="mt-4 rounded-lg border px-4 py-2 text-sm" onClick={() => reset()}>
            Recharger
          </button>
        </div>
      </body>
    </html>
  )
}
