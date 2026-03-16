import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Link from '@/components/LocalizedLink';
import { generateMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('maintenance');
  return generateMeta({
    title: t('meta_title'),
    description: t('meta_description'),
    url: '/maintenance',
    noindex: true,
  });
}

export default async function MaintenancePage() {
  const t = await getTranslations('maintenance');
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      role="main"
      aria-labelledby="maintenance-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[var(--shadow-lg)] sm:p-10">
        <h1 id="maintenance-title" className="heading-page sm:text-3xl">
          {t('heading')}
        </h1>
        <p className="mt-3 text-[15px] text-token-text/75">{t('message')}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
          prefetch={false}
        >
          {t('cta')}
        </Link>
      </div>
    </main>
  );
}
