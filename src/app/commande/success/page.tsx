// src/app/commande/success/page.tsx — SUCCESS ++ (noindex, wrapper client pour dynamic)
import PurchaseTrackerClient from './PurchaseTrackerClient'

import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'

export const metadata: Metadata = {
  title: 'Commande réussie',
  description: 'Votre commande a bien été enregistrée. Confirmation et suivi par email.',
  robots: { index: false, follow: false },
}

export default function OrderSuccessPage({
  searchParams,
}: { searchParams: { session_id?: string; mock?: string } }) {
  const sess = searchParams?.session_id
  const mock = searchParams?.mock === '1'

  return (
    <main className="container max-w-3xl mx-auto px-4 py-24 text-center" role="main" aria-labelledby="success-title">
      <h1 id="success-title" className="text-3xl font-extrabold text-gray-900 dark:text-white">
        Merci pour votre commande 🎉
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
        Un email de confirmation a été envoyé à l&apos;adresse indiquée.
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Livraison sous 48–72 h · Suivi colis par email
      </p>

      <div className="mt-6 inline-block text-left rounded-xl border border-gray-200 dark:border-zinc-700 p-4 bg-white/60 dark:bg-zinc-900/40">
        {mock ? (
          <p className="text-sm">Mode démo : aucune transaction réelle.</p>
        ) : sess ? (
          <p className="text-sm">
            Référence : <code className="font-mono text-xs" title={sess}>{sess.length > 12 ? `…${sess.slice(-12)}` : sess}</code>
          </p>
        ) : (
          <p className="text-sm">Session non spécifiée.</p>
        )}
      </div>

      <PurchaseTrackerClient sessionId={sess} mock={mock} />

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white shadow-lg hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]"
        >
          Continuer mes achats
        </Link>
        <Link
          href="/account/mes-commandes"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] dark:border-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-800"
        >
          Voir mes commandes
        </Link>
      </div>
    </main>
  )
}
