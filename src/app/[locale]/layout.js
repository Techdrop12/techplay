// src/app/[locale]/layout.js
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const locales = ['fr', 'en'];

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const awaitedParams = await params;
  const locale = awaitedParams?.locale;

  if (!locales.includes(locale)) {
    return notFound();
  }

  // Charge les messages de traduction pour la locale courante
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="transition-colors duration-300 bg-white text-black dark:bg-black dark:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LayoutWithAnalytics>
            {children}
          </LayoutWithAnalytics>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
