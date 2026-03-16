import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { generateMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo');
  return generateMeta({
    title: t('login_title'),
    description: t('login_description'),
    url: '/login',
    noindex: true,
  });
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
