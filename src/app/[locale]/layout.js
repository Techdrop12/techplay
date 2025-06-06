// src/app/[locale]/layout.js

import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const inter = Inter({ subsets: ['latin'] });

/**
 * Nous générons ici les deux chemins SSG possibles : /fr et /en.
 * Cela s’applique à toute la sous-arborescence [locale]/...
 */
export function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

/**
 * Si la page /[locale] est appelée avec une locale autre que "fr" ou "en",
 * on renvoie un 404.
 *
 * Ce layout est un Server Component. Il charge les messages i18n
 * dynamiquement (import asynchrone) puis englobe tout le rendu
 * dans <LocaleProvider> pour que useTranslations() fonctionne partout.
 */
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({ params, children }) {
  const { locale } = params;

  // 1) Si la locale n’est ni "fr" ni "en", on renvoie une 404
  if (!['fr', 'en'].includes(locale)) {
    return notFound();
  }

  // 2) On importe le fichier de traductions correspondant à la locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    // Si le JSON n’existe pas pour cette locale, on renvoie une 404
    return notFound();
  }

  return (
    <html lang={locale}>
      <head />
      <body className={inter.className}>
        {/*
          LocaleProvider reçoit la locale et les messages chargés,
          puis fournit un contexte i18n à tous les enfants via next-intl.
        */}
        <LocaleProvider locale={locale} messages={messages}>
          <LayoutWithAnalytics locale={locale}>
            {children}
          </LayoutWithAnalytics>
        </LocaleProvider>
      </body>
    </html>
  );
}
