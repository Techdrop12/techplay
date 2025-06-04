// src/app/[locale]/layout.js

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import ExitPopup from '@/components/ExitPopup';
import useHotjar from '@/lib/hotjar';

// 1) On statiquement génère /fr et /en
export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

// 2) On désactive d’autres locales dynamiques
export const dynamicParams = false;

// 3) Import des messages de traduction
export default async function LocaleLayout({ params: { locale }, children }) {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    return notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        {/* Ce lien vers /manifest.json est absolu : il chargera toujours root/manifest.json */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className="bg-white text-black dark:bg-zinc-900 dark:text-white antialiased"
        suppressHydrationWarning
      >
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
