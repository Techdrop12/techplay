// ✅ src/app/[locale]/layout.js

import { notFound } from 'next/navigation';
import { getMessages } from '@/lib/getMessages';
import { locales } from '@/lib/i18n';
import { setRequestLocale } from 'next-intl/server';
import LayoutWithAnalytics from './LayoutWithAnalytics';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }) {
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.homepage_title || 'TechPlay',
    description: messages.seo?.homepage_description || '',
  };
}

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);

  return <LayoutWithAnalytics locale={locale}>{children}</LayoutWithAnalytics>;
}
