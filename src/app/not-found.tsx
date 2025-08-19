// src/app/not-found.tsx
import { Suspense } from 'react'
import Link from 'next/link'

export const metadata = { title: 'Page introuvable – TechPlay' }

function NotFoundClientSafe() {
  return (
    <div className="text-center py-32">
      <h1 className="text-3xl font-bold mb-4">Page introuvable</h1>
      <p className="mb-6">La page que vous recherchez n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="text-blue-600 hover:underline">Retour à l’accueil</Link>
    </div>
  )
}

export default function NotFoundPage() {
  return (
    <main
      id="main"
      className="max-w-4xl mx-auto px-4 pt-32 pb-20 text-center"
      aria-labelledby="nf-title"
      role="main"
    >
      <h1
        id="nf-title"
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light"
      >
        404 – Page introuvable
      </h1>

      <p className="mt-4 text-muted-foreground">
        Désolé, cette page n’existe pas ou a été déplacée.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-white font-semibold shadow hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/50"
          aria-label="Retour à l’accueil"
        >
          ← Retour à l’accueil
        </Link>
      </div>

      <Suspense fallback={<p className="mt-10 text-sm text-gray-500">Chargement…</p>}>
        <NotFoundClientSafe />
      </Suspense>
    </main>
  )
}
