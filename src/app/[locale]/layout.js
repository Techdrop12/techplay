// src/app/[locale]/layout.js

import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const inter = Inter({ subsets: ['latin'] });

/**
 * On pré-génère statiquement les deux chemins : /fr et /en
 * (couvre toute l’arborescence [locale]/...)
 */
export function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({ params, children }) {
  const { locale } = params;

  // 1) Si la locale n’est ni "fr" ni "en", on renvoie un 404
  if (!['fr', 'en'].includes(locale)) {
    return notFound();
  }

  // 2) On importe dynamiquement le fichier JSON de traductions correspondant
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    // Si le JSON n’existe pas, on renvoie un 404
    return notFound();
  }

  return (
    <html lang={locale}>
      <head />
      <body className={inter.className}>
        {/*
          On fournit ensuite le contexte i18n à toute l’arborescence en
          empaquetant dans <LocaleProvider locale={locale} messages={messages}>
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
