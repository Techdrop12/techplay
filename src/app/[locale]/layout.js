import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const locales = ['fr', 'en'];

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params: rawParams }) {
  const params = await rawParams; // ✅ Nouvelle syntaxe Next 15
  const locale = params?.locale;

  if (!locales.includes(locale)) return notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
