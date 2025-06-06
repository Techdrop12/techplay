// File: src/app/[locale]/a-propos/page.js

import { notFound } from 'next/navigation';
import { getTranslator } from 'next-intl/server';    // ← au lieu de createTranslator
import SEOHead from '@/components/SEOHead';

/**
 * Afin de pré-générer /fr/a-propos et /en/a-propos, on exporte generateStaticParams.
 */
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

/**
 * Ce composant est un Server Component. On utilise getTranslator()
 * pour récupérer la fonction t('clé') côté serveur.
 */
export default async function AboutPage({ params: { locale } }) {
  let t;
  try {
    // getTranslator(lng, namespace) renvoie un t() côté serveur
    t = await getTranslator(locale, 'a_propos');
  } catch {
    // Si la clé de messages “a_propos” n’existe pas pour cette locale, on 404
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
