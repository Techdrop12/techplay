import type { Metadata } from 'next'

import BackToHomeLink from '@/components/BackToHomeLink'

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
        <div className="mt-8">
          <BackToHomeLink variant="outline" className="focus-visible:ring-offset-2" />
        </div>
      </div>
    </main>
  )
}
