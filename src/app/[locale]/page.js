// ✅ src/app/[locale]/page.js

import HomeClient from '@/components/HomeClient';
import SEOHead from '@/components/SEOHead';
import HomeJsonLd from '@/components/HomeJsonLd';

export const dynamic = 'force-dynamic';

export default function LocaleHomePage({ params }) {
  const { locale } = params;
  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Accueil TechPlay' : 'TechPlay Home'}
        overrideDescription={locale === 'fr'
          ? 'Découvrez les meilleures nouveautés high-tech sur TechPlay.'
          : 'Discover the best high-tech innovations on TechPlay.'}
      />
      <HomeJsonLd locale={locale} />
      <HomeClient locale={locale} />
    </>
  );
}
