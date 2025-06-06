// src/app/[locale]/a-propos/page.js

import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';

/**
 * Pour pré-générer /fr/a-propos et /en/a-propos
 */
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

/**
 * Composant serveur « À propos ».
 * 1) On importe le JSON global (fr.json ou en.json) de messages ;
 * 2) On crée manuellement un traducteur pour le namespace "a_propos" ;
 * 3) On passe à SEOHead + on affiche le contenu.
 */
export default async function AboutPage({ params: { locale } }) {
  // 1) Charger l’ensemble des messages i18n pour la locale
  let allMessages;
  try {
    allMessages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    // Si le fichier de messages n'existe pas, on renvoie un 404
    return notFound();
  }

  // 2) Extraire le namespace "a_propos" :
  const namespace = allMessages['a_propos'];
  if (!namespace) {
    // Si le namespace "a_propos" n’existe pas, 404
    return notFound();
  }

  // 3) Création manuelle d'une fonction t(key) pour lire namespace[key]
  const t = (key) => {
    // si la clé n'existe pas, on renvoie la clé brute en fallback
    return namespace[key] ?? key;
  };

  return (
    <>
      {/* SEOHead full-option */}
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
