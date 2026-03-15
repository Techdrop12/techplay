import type { Metadata } from 'next'

import BackToHomeLink from '@/components/BackToHomeLink'
import ConfidentialitePrefs from '@/components/confidentialite/ConfidentialitePrefs'
import { getSitePage } from '@/lib/site-pages'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et gestion des cookies du site TechPlay.',
  robots: { index: true, follow: true },
}

const FALLBACK_TITLE = 'Politique de confidentialité'
const FALLBACK_CONTENT =
  '<p class="text-[var(--step-0)] leading-relaxed text-token-text/80">Nous respectons votre vie privée. Les données collectées sur ce site sont utilisées pour le bon fonctionnement du service, la mesure d\'audience si vous l\'acceptez, et éventuellement la publicité.</p>'

export default async function ConfidentialitePage() {
  const page = await getSitePage('confidentialite')
  const title = (page?.title?.trim()) || FALLBACK_TITLE
  const content = (page?.content?.trim()) || FALLBACK_CONTENT

  return (
    <main className="container-app mx-auto max-w-3xl py-10 sm:py-12" role="main" aria-labelledby="confidentialite-title">
      <div className="card card-padding shadow-[var(--shadow-md)]">
        <h1 id="confidentialite-title" className="heading-page mb-6">
          {title}
        </h1>
        <div
          className="content-readability text-[15px] text-token-text/85 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <ConfidentialitePrefs />
        <p className="mt-6 text-[12px] text-token-text/70">
          Vous pouvez aussi gérer vos préférences via la bannière en bas de page lors de votre première visite.
        </p>
        <div className="mt-8">
          <BackToHomeLink variant="outline" className="focus-visible:ring-offset-2" />
        </div>
      </div>
    </main>
  )
}
