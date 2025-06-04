// app/[locale]/layout.js

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import ExitPopup from '@/components/ExitPopup';

// 1) Génère au build les deux routes statiques : /fr et /en
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

// 2) Désactive toute locale dynamique non listée ici
export const dynamicParams = false;

// 3) Server Component : charge le JSON de traduction avant rendu
export default async function LocaleLayout({ children, params: { locale } }) {
  let messages;
  try {
    // On importe dynamiquement src/messages/fr.json ou src/messages/en.json
    messages = (await import(`../../../src/messages/${locale}.json`)).default;
  } catch (e) {
    // Si la locale n’existe pas, on renvoie une 404
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Metas communes à toutes les locales */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className="bg-white text-black dark:bg-zinc-900 dark:text-white antialiased"
        suppressHydrationWarning
      >
        {/* 4) On fournit le provider de traduction au client */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider locale={locale}>
            <LayoutWithAnalytics>
              {children}
            </LayoutWithAnalytics>
          </LocaleProvider>
          <AnalyticsScripts />
          <EmailCapturePopup />
          <ExitPopup />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
