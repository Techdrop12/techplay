import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import BackToHomeLink from '@/components/BackToHomeLink'
import Link from '@/components/LocalizedLink'
import ConfidentialitePrefs from '@/components/confidentialite/ConfidentialitePrefs'
import { generateMeta } from '@/lib/seo'

const SECTIONS = [
  'intro',
  'responsable',
  'donnees',
  'finalites',
  'bases',
  'destinataires',
  'duree',
  'droits',
  'cookies',
  'securite',
  'modifications',
  'contact',
] as const

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('confidentialite')
  return generateMeta({
    title: t('page_title'),
    description: t('meta_description'),
    url: '/confidentialite',
    image: '/og-image.jpg',
  })
}

export default async function ConfidentialitePage() {
  const t = await getTranslations('confidentialite')

  return (
    <main
      className="container-app mx-auto max-w-3xl py-10 sm:py-12"
      role="main"
      aria-labelledby="confidentialite-title"
    >
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="confidentialite-title" className="heading-page mb-2">
          {t('page_title')}
        </h1>
        <p className="mb-6 text-[13px] text-token-text/60">{t('last_updated')}</p>

        <nav
          aria-label={t('toc_title')}
          className="mb-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/50 px-5 py-4"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-token-text/70">
            {t('toc_title')}
          </h2>
          <ul className="flex flex-col gap-1.5 text-[14px]">
            {SECTIONS.map((key) => {
              const title = t(`section_${key}_title`)
              return (
                <li key={key}>
                  <a
                    href={`#section-${key}`}
                    className="text-[hsl(var(--accent))] underline-offset-2 hover:underline"
                  >
                    {title}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="content-readability space-y-10 text-[15px] text-token-text/85">
          {SECTIONS.map((key) => {
            const title = t(`section_${key}_title`)
            const content = t(`section_${key}_content`)
            const paragraphs = splitParagraphs(content)
            return (
              <section
                key={key}
                id={`section-${key}`}
                className="scroll-mt-24 space-y-3"
              >
                <h2 className="heading-subsection text-[1.1rem] font-semibold text-[hsl(var(--text))]">
                  {title}
                </h2>
                <div className="space-y-2">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                {key === 'contact' && (
                  <p className="mt-3">
                    <Link
                      href="/contact"
                      className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
                    >
                      → {t('link_contact')}
                    </Link>
                  </p>
                )}
              </section>
            )
          })}
        </div>

        <section className="mt-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/30 px-5 py-4">
          <ConfidentialitePrefs />
          <p className="mt-4 text-[12px] text-token-text/70">
            {t('cookie_banner_hint')}
          </p>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[hsl(var(--border))] pt-8">
          <BackToHomeLink variant="outline" className="focus-visible:ring-offset-2" />
          <span className="text-[14px] text-token-text/60">{t('see_also')} :</span>
          <Link
            href="/mentions-legales"
            className="text-[14px] font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
          >
            {t('link_mentions')}
          </Link>
          <span className="text-token-text/40">·</span>
          <Link
            href="/cgv"
            className="text-[14px] font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
          >
            {t('link_cgv')}
          </Link>
        </div>
      </div>
    </main>
  )
}
