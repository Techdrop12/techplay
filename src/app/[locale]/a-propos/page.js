// File: src/app/[locale]/a-propos/page.js

import { notFound } from 'next/navigation';
import { createTranslator } from 'next-intl/server';
import SEOHead from '@/components/SEOHead';

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

export default async function AboutPage({ params: { locale } }) {
  // “createTranslator” looks up the messages loaded by LayoutWithAnalytics → LocaleProvider
  // and returns a `t` function for the given locale + namespace.
  let t;
  try {
    t = createTranslator(locale, 'a_propos');
  } catch {
    // If the “a_propos” namespace doesn’t exist for this locale, show a 404
    return notFound();
  }

  return (
    <>
      <SEOHead
        titleKey="a_propos_title"
        descriptionKey="a_propos_description"
      />

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
    </>
  );
}
