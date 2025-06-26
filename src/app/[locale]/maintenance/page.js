// ✅ src/app/[locale]/maintenance/page.js

import SEOHead from '@/components/SEOHead';

export default function MaintenancePage({ params }) {
  const { locale } = params;
  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Maintenance en cours' : 'Maintenance ongoing'}
        overrideDescription={
          locale === 'fr'
            ? 'TechPlay est en maintenance. Merci de votre patience.'
            : 'TechPlay is under maintenance. Thank you for your patience.'
        }
        noIndex
      />
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-6"></div>
        <h1 className="text-xl font-bold mb-2">
          {locale === 'fr'
            ? 'Maintenance en cours'
            : 'Maintenance ongoing'}
        </h1>
        <p className="text-gray-600">
          {locale === 'fr'
            ? "Notre site revient dans quelques instants. Merci de votre patience !"
            : "Our site will be back online soon. Thanks for your patience!"}
        </p>
      </div>
    </>
  );
}
