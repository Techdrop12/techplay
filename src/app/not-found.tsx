// src/app/not-found.tsx
import { getTranslations } from 'next-intl/server';

import NotFoundPageContent from '@/components/NotFoundPageContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  const t = await getTranslations('seo_extra');
  return {
    title: t('not_found_page_title'),
    description: t('not_found_page_description'),
    robots: { index: false, follow: true },
  };
}

export default function NotFoundPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-5xl px-4 pt-32 pb-24 text-center"
      aria-labelledby="nf-title"
      role="main"
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-lg)]">
        <NotFoundPageContent />
      </div>
    </main>
  );
}
