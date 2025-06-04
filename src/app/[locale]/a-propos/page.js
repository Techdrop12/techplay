// File: src/app/[locale]/a-propos/page.js

import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'

// Génère /fr/a-propos et /en/a-propos au build
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ]
}

// Composant server-side pour “À propos”
export default function AboutPage({ params: { locale } }) {
  const t = useTranslations('a_propos')

  if (!t) {
    return notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg text-gray-700 mb-8">{t('description')}</p>

      <section className="prose dark:prose-invert">
        <h2>{t('our_mission_title')}</h2>
        <p>{t('our_mission_text')}</p>

        <h2>{t('our_team_title')}</h2>
        <p>{t('our_team_text')}</p>

        <h2>{t('our_values_title')}</h2>
        <p>{t('our_values_text')}</p>
      </section>
    </main>
  )
}
