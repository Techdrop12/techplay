import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente du site TechPlay. Livraison, retours, paiement sécurisé.',
  robots: { index: true, follow: true },
}

export default function CGVPage() {
  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="cgv-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="cgv-title" className="heading-page mb-6">
          Conditions générales de vente
        </h1>
        <p className="text-[15px] leading-relaxed text-token-text/85">
          Les présentes conditions régissent les ventes conclues sur le site TechPlay. En validant votre commande, vous acceptez ces conditions sans réserve.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
