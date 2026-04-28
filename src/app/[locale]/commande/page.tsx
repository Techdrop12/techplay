import { getTranslations } from 'next-intl/server';

import type { Metadata } from 'next';

import CommandeClient from '@/app/commande/page';
import { generateMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo');
  return generateMeta({
    title: t('checkout_title'),
    description: t('checkout_description'),
    url: '/commande',
    noindex: true,
  });
}

export default CommandeClient;
