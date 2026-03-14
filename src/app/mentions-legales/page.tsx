import type { Metadata } from 'next'

import BackToHomeLink from '@/components/BackToHomeLink'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et éditeur du site TechPlay. Siège social, contact.',
  robots: { index: true, follow: true },
}

export default function MentionsLegalesPage() {
  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="mentions-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="mentions-title" className="heading-page mb-6">
          Mentions légales
        </h1>
        <p className="text-[15px] leading-relaxed text-token-text/85">
          Éditeur du site : TechPlay • Siège social : Paris, France • Contact : contact@techplay.fr
        </p>
        <div className="mt-8">
          <BackToHomeLink variant="outline" className="focus-visible:ring-offset-2" />
        </div>
      </div>
    </main>
  )
}
