import type { Metadata } from 'next'

import BackToHomeLink from '@/components/BackToHomeLink'
import { getSitePage } from '@/lib/site-pages'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et éditeur du site TechPlay. Siège social, contact.',
  robots: { index: true, follow: true },
}

const FALLBACK_TITLE = 'Mentions légales'
const FALLBACK_CONTENT = '<p class="content-readability text-[15px] text-token-text/85">Éditeur du site : TechPlay • Siège social : Paris, France • Contact : contact@techplay.fr</p>'

export default async function MentionsLegalesPage() {
  const page = await getSitePage('mentions-legales')
  const title = (page?.title?.trim()) || FALLBACK_TITLE
  const content = (page?.content?.trim()) || FALLBACK_CONTENT

  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="mentions-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="mentions-title" className="heading-page mb-6">
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
