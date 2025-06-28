// ✅ /src/app/[locale]/layout.js (corrigé full option)
import '@/styles/globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const locales = ['fr', 'en'];

export const metadata = {
  title: 'TechPlay – Produits High-Tech',
  description: 'Boutique TechPlay. Découvrez les meilleurs produits technologiques tendance.',
};

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();
  unstable_setRequestLocale(locale);

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} className="scroll-smooth dark">
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LayoutWithAnalytics locale={locale}>{children}</LayoutWithAnalytics>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
