// src/app/[locale]/layout.js

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import ExitPopup from '@/components/ExitPopup';
import useHotjar from '@/lib/hotjar';

// 1) Génère statiquement /fr et /en au build
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

// 2) Empêche la génération dynamique d’autres locales
export const dynamicParams = false;

// 3) Charge les messages de traduction côté serveur
export default async function LocaleLayout({ params: { locale }, children }) {
  let messages;
  try {
    // On importe le JSON de traduction depuis src/messages/<locale>.json
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    // Si le fichier n'existe pas, on renvoie un 404
    return notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Métadonnées communes */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className="bg-white text-black dark:bg-zinc-900 dark:text-white antialiased"
        suppressHydrationWarning
      >
        {/* 4) Provider next-intl pour la traduction */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider locale={locale}>
            <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
          </LocaleProvider>
          <AnalyticsScripts />
          <EmailCapturePopup />
          <ExitPopup />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
