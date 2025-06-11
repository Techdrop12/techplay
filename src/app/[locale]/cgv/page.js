// ✅ src/app/[locale]/cgv/page.js
import { getTranslations } from 'next-intl/server';
import SEOHead from '@/components/SEOHead';

export const dynamic = 'force-dynamic';

export default async function CGVPage({ params }) {
  const locale = params.locale;
  const tSeo = await getTranslations({ locale, namespace: 'seo' });
  const tCgv = await getTranslations({ locale, namespace: 'cgv' });

  const title = tCgv('title');
  const intro = tCgv('intro');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const basePath = `${siteUrl}/${locale}`;
  const breadcrumbSegments = [
    { label: tSeo('homepage_title'), url: `${basePath}` },
    { label: title, url: `${basePath}/cgv` },
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
        </section>
      </div>
    </>
  );
}
