// src/app/products/packs/page.tsx
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import type { Pack } from '@/types/product';
import type { Metadata } from 'next';

import Link from '@/components/LocalizedLink';
import PackCard from '@/components/PackCard';
import SectionTitle from '@/components/SectionTitle';
import SectionWrapper from '@/components/SectionWrapper';
import { BRAND } from '@/lib/constants';
import { getRecommendedPacks } from '@/lib/data';

export const revalidate = 900;

const SITE = BRAND.URL;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('packs');
  const title = t('page_title');
  const description = t('page_description');
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/products/packs` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE}/products/packs`,
    },
  };
}

export default async function PacksPage() {
  const packs: Pack[] = await getRecommendedPacks();
  const t = await getTranslations('packs');

  return (
    <SectionWrapper>
      <SectionTitle title={t('title')} />
      {packs.length === 0 ? (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <span className="inline-block rounded-full bg-[hsl(var(--accent)/0.15)] px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
            Bientôt disponible
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:text-3xl">
            Des packs gaming sélectionnés arrivent bientôt
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-token-text/70">
            En attendant, construis ton propre setup sur mesure et{' '}
            <span className="font-semibold text-[hsl(var(--accent))]">économise automatiquement 10 %</span>{' '}
            grâce au bundle builder.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/#builder"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_0_24px_hsl(var(--accent)/0.3)] transition hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]"
            >
              Créer mon bundle
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-7 py-3.5 text-[14px] font-semibold transition hover:bg-[hsl(var(--surface-2))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]"
            >
              {t('view_all_products')}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[hsl(var(--border))]/50 pt-8">
            <span className="text-[12px] font-medium text-token-text/50">Explorer par catégorie :</span>
            <Link href="/products?cat=casques" className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[12px] font-semibold transition hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--accent)/0.06)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]">
              {t('category_heads')} 🎧
            </Link>
            <Link href="/products?cat=claviers" className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[12px] font-semibold transition hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--accent)/0.06)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]">
              {t('category_claviers')} ⌨️
            </Link>
            <Link href="/products?cat=souris" className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[12px] font-semibold transition hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--accent)/0.06)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]">
              {t('category_souris')} 🖱️
            </Link>
          </div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl bg-[hsl(var(--surface-2))]"
                  aria-hidden
                />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <PackCard key={pack.slug} pack={pack} />
            ))}
          </div>
        </Suspense>
      )}
    </SectionWrapper>
  );
}
