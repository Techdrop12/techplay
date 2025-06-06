// src/app/[locale]/a-propos/page.js
import { notFound } from 'next/navigation';
import { createTranslator } from 'next-intl/server';
import SEOHead from '@/components/SEOHead';

/**
 * Pour pré-générer /fr/a-propos et /en/a-propos (SSG)
 */
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

/**
 * Composant serveur “À propos”.
 * On importe le JSON global (fr.json ou en.json), puis on crée un traducteur
 * pour le namespace “a_propos” via createTranslator({ namespace: 'a_propos' }).
 */
export default async function AboutPage({ params: { locale } }) {
  // 1) Charger l’ensemble des messages i18n pour la locale (ex. "@/messages/fr.json")
  let allMessages;
  try {
    allMessages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    // Si le fichier de messages n’existe pas, on renvoie un 404
    return notFound();
  }

  // 2) Créer un traducteur pour le namespace “a_propos”
  let t;
  try {
    t = createTranslator({
      locale,
      messages: allMessages,
      namespace: 'a_propos'
    });
  } catch {
    // Si le namespace “a_propos” n’existe pas dedans, on 404
    return notFound();
  }

  // 3) Définir les segments de breadcrumb (pour JSON-LD)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const basePath = `${siteUrl}/${locale}`;
  const breadcrumbSegments = [
    { label: t('title'), url: `${basePath}` },
    { label: t('title'), url: `${basePath}/a-propos` }
  ];

  return (
    <>
      <SEOHead
        titleKey="a_propos_title"
        descriptionKey="a_propos_description"
        breadcrumbSegments={breadcrumbSegments}
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
