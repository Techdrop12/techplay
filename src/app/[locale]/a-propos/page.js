// ✅ src/app/[locale]/a-propos/page.js

import SEOHead from '@/components/SEOHead';

export default function AboutPage({ params }) {
  const { locale } = params;
  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'À propos de TechPlay' : 'About TechPlay'}
        overrideDescription={locale === 'fr'
          ? 'Notre mission : rendre la tech accessible à tous.'
          : 'Our mission: Make tech accessible for everyone.'}
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{locale === 'fr' ? 'À propos' : 'About'}</h1>
        <p>
          {locale === 'fr'
            ? 'TechPlay est la boutique de référence pour les passionnés de nouvelles technologies. Notre équipe sélectionne les meilleurs produits et vous accompagne dans vos achats !'
            : 'TechPlay is the go-to store for tech enthusiasts. Our team curates the best products and supports you in your shopping!'}
        </p>
      </div>
    </>
  );
}
