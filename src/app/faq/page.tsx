import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import FAQ from '@/components/FAQ';
import Link from '@/components/LocalizedLink';
import { generateMeta } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq');
  return generateMeta({
    title: t('heading'),
    description: t('intro'),
    url: '/faq',
    image: '/og-image.jpg',
  });
}

export default async function FAQPage() {
  const t = await getTranslations('faq');

  return (
    <main
      className="container-app mx-auto w-full max-w-3xl pt-24 pb-20"
      aria-labelledby="faq-page-title"
      role="main"
    >
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          FAQ
        </p>
        <h1 id="faq-page-title" className="heading-page mt-2">
          {t('heading')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-token-text/75">
          {t('intro')}{' '}
          <Link
            href="/contact"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
          >
            {t('contact_link')}
          </Link>
          .
        </p>
      </header>

      <section aria-label={t('heading')} className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm">
        <FAQ showSectionHeading={false} />
      </section>
    </main>
  );
}

