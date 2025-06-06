// src/app/[locale]/cgv/page.js
'use client';

import { useLocale, useTranslations } from 'next-intl';
import SEOHead from '@/components/SEOHead';

/**
 * Page “Conditions Générales de Vente” (CGV).
 * Composant client statique avec SEOHead complet et JSON-LD de breadcrumbs.
 */
export default function CGVPage() {
  const locale = useLocale();
  const tSeo = useTranslations('seo'); // pour « seo.cgv_title » / « seo.cgv_description »
  const tCgv = useTranslations('cgv'); // pour « cgv.title », « cgv.intro », etc.

  // Titre / intro extraits du namespace "cgv"
  const title = tCgv('title');
  const intro = tCgv('intro');

  // Breadcrumb JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const basePath = `${siteUrl}/${locale}`;
  const breadcrumbSegments = [
    { label: tSeo('homepage_title'), url: `${basePath}` },
    { label: title,                          url: `${basePath}/cgv` },
  ];

  return (
    <>
      <SEOHead
        overrideTitle={tSeo('cgv_title')}
        overrideDescription={tSeo('cgv_description')}
        breadcrumbSegments={breadcrumbSegments}
      />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-gray-700 mb-6">{intro}</p>

        <section className="prose dark:prose-invert">
          <h2>{tCgv('section1_title')}</h2>
          <p>{tCgv('section1_text')}</p>

          <h2>{tCgv('section2_title')}</h2>
          <p>{tCgv('section2_text')}</p>

          {/* Si besoin : d’autres sections… */}
        </section>
      </div>
    </>
  );
}
