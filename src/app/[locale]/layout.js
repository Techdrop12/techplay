// ✅ src/app/[locale]/layout.js

import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({ params, children }) {
  const { locale } = params;

  if (!['fr', 'en'].includes(locale)) return notFound();

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    return notFound();
  }

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <LayoutWithAnalytics locale={locale}>
        {children}
      </LayoutWithAnalytics>
    </LocaleProvider>
  );
}
