import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import WishlistShell from './WishlistShell';
import { isLocale, type Locale } from '@/lib/language';

export const revalidate = 300;

const TITLES: Record<Locale, string> = {
  fr: 'Ma liste de souhaits',
  en: 'My wishlist',
};

const DESCRIPTIONS: Record<Locale, string> = {
  fr: 'Retrouvez vos produits favoris enregistrés sur TechPlay. Ajoutez-les au panier en un clic.',
  en: 'Find your saved favorites on TechPlay. Add them to cart in one click.',
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : 'fr';
  return {
    title: `${TITLES[loc]} | TechPlay`,
    description: DESCRIPTIONS[loc],
    robots: { index: true, follow: true },
  };
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WishlistShell />;
}
