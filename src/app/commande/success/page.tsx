// src/app/commande/success/page.tsx — SUCCESS ++ avec PurchaseTracker (noindex)
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Commande réussie',
  robots: { index: false, follow: false },
}

const PurchaseTracker = dynamic(() => import('@/components/checkout/PurchaseTracker'), { ssr: false })

export default function OrderSuccessPage({
  searchParams,
}: { searchParams: { session_id?: string; mock?: string } }) {
  const sess = searchParams?.session_id
  const mock = searchParams?.mock === '1'

  return (
    <main className="container max-w-3xl mx-auto px-4 py-24 text-center">
      {/* Tracking achat (dédupliqué) */}
      <PurchaseTracker sessionId={sess} mock={mock} />

      <h1 className="text-3xl font-extrabold">Merci pour votre commande 🎉</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        Un email de confirmation va vous être envoyé dans quelques instants.
      </p>

      <div className="mt-6 inline-block text-left rounded-xl border border-gray-200 dark:border-zinc-700 p-4 bg-white/60 dark:bg-zinc-900/40">
        {mock ? (
          <p className="text-sm">Mode démo : aucune transaction réelle.</p>
        ) : sess ? (
          <p className="text-sm">
            ID de session Stripe : <code className="font-mono">{sess}</code>
          </p>
        ) : (
          <p className="text-sm">Session non spécifiée.</p>
        )}
      </div>

      <div className="mt-8 space-x-3">
        <a href="/" className="inline-block rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800">
          Continuer mes achats
        </a>
        <a href="/orders" className="inline-block rounded-lg bg-[hsl(var(--accent))] text-white px-4 py-2 text-sm font-semibold hover:opacity-90">
          Voir mes commandes
        </a>
      </div>
    </main>
  )
}
