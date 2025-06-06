// src/app/[locale]/layout.js

import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import LocaleProvider from '@/components/LocaleProvider';
import LayoutWithAnalytics from './LayoutWithAnalytics';

const inter = Inter({ subsets: ['latin'] });

/**
 * Pour les pages <locale>, on veut pré-générer deux chemins : /fr et /en
 * (SSG). C’est la même logique que dans page.js,
 * on aurait pu extraire generateStaticParams dans _layout_,
 * mais on le garde ici pour rendre explicite le fait qu’il
 * s’applique à toute la sous-arborescence [locale].
 */
export function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

/**
 * Ce layout est un Server Component.
 * Il importe le JSON i18n relatif à la locale demandée,
 * puis enrobe les children avec <LocaleProvider>.
 */
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({ params, children }) {
  const { locale } = params;

  // Si la locale n’est ni "fr" ni "en", on fait un 404.
  if (!['fr', 'en'].includes(locale)) {
    return notFound();
  }

  // Essayer d’importer le fichier i18n correspondant (async).
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (e) {
    // Si le JSON n’existe pas, 404
    return notFound();
  }

  return (
    <html lang={locale}>
      <head />
      <body className={inter.className}>
        <LocaleProvider locale={locale} messages={messages}>
          <LayoutWithAnalytics locale={locale}>
            {children}
          </LayoutWithAnalytics>
        </LocaleProvider>
      </body>
    </html>
  );
}
