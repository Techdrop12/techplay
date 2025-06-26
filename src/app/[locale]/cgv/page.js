// ✅ src/app/[locale]/cgv/page.js

import SEOHead from '@/components/SEOHead';

export default function CGVPage({ params }) {
  const { locale } = params;
  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Conditions Générales de Vente' : 'Terms & Conditions'}
        overrideDescription={
          locale === 'fr'
            ? 'Consultez les conditions générales de vente de TechPlay.'
            : 'Read TechPlay terms & conditions.'
        }
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr'
            ? 'Conditions Générales de Vente'
            : 'Terms & Conditions'}
        </h1>
        <div className="prose max-w-none">
          {/* Placez ici le texte de vos CGV ! */}
          <p>
            {locale === 'fr'
              ? "Bienvenue sur nos CGV. Merci de votre confiance sur TechPlay. Les ventes sont soumises à nos conditions générales consultables ci-dessous…"
              : "Welcome to our T&C. Thank you for trusting TechPlay. Sales are subject to the following terms and conditions…"}
          </p>
        </div>
      </div>
    </>
  );
}
