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
    <main className="mx-auto max-w-2xl px-4 py-20 sm:py-28" role="main" aria-labelledby="success-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[var(--shadow-lg)] sm:p-10">
        <h1 id="success-title" className="heading-page">
          Merci pour votre commande
        </h1>
        <p className="mt-3 text-[15px] text-token-text/75">
          Un email de confirmation a été envoyé à l&apos;adresse indiquée.
        </p>
        <p className="mt-1 text-[13px] text-token-text/60">
          Livraison sous 48–72 h · Suivi colis par email
        </p>

        <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 p-4 text-left">
          {mock ? (
            <p className="text-[13px] text-token-text/80">Mode démo : aucune transaction réelle.</p>
          ) : sess ? (
            <p className="text-[13px] text-token-text/80">
              Référence : <code className="font-mono text-xs" title={sess}>{sess.length > 12 ? `…${sess.slice(-12)}` : sess}</code>
            </p>
          ) : (
            <p className="text-[13px] text-token-text/80">Session non spécifiée.</p>
          )}
        </div>

        <PurchaseTrackerClient sessionId={sess} mock={mock} />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-lg)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
          >
            Continuer mes achats
          </Link>
          <Link
            href="/account/mes-commandes"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-3 text-[15px] font-semibold text-token-text transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Voir mes commandes
          </Link>
        </div>
      </div>
    </main>
  )
}
