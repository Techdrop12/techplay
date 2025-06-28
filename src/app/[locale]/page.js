// ✅ /src/app/[locale]/page.js (accueil localisé)
import HomeClient from '@/components/HomeClient';
import SEOHead from '@/components/SEOHead';

export default function LocaleHome() {
  return (
    <>
      <SEOHead />
      <HomeClient />
    </>
  );
}
