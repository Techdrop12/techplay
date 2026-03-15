import type { Metadata } from 'next'

import BackToHomeLink from '@/components/BackToHomeLink'
import { getSitePage } from '@/lib/site-pages'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente du site TechPlay. Livraison, retours, paiement sécurisé.',
  robots: { index: true, follow: true },
}

const FALLBACK_TITLE = 'Conditions générales de vente'
const FALLBACK_CONTENT = '<p class="content-readability text-[15px] text-token-text/85">Les présentes conditions régissent les ventes conclues sur le site TechPlay. En validant votre commande, vous acceptez ces conditions sans réserve.</p>'

export default async function CGVPage() {
  const page = await getSitePage('cgv')
  const title = (page?.title?.trim()) || FALLBACK_TITLE
  const content = (page?.content?.trim()) || FALLBACK_CONTENT

  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="cgv-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="cgv-title" className="heading-page mb-6">
          {title}
        </h1>
        <div
          className="content-readability text-[15px] text-token-text/85 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="mt-8">
          <BackToHomeLink variant="outline" className="focus-visible:ring-offset-2" />
        </div>
      </div>
    </main>
  )
}
