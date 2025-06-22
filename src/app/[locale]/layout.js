// ✅ src/app/[locale]/layout.js
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getMessages } from '@/lib/getMessages';
import LayoutWithAnalytics from './LayoutWithAnalytics';
import { locales } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();

  unstable_setRequestLocale(locale);

  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LayoutWithAnalytics locale={locale}>{children}</LayoutWithAnalytics>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
