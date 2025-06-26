// ✅ src/app/[locale]/faq/page.js

import SEOHead from '@/components/SEOHead';

export default function FAQPage({ params }) {
  const { locale } = params;

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'FAQ' : 'FAQ'}
        overrideDescription={
          locale === 'fr'
            ? 'Questions fréquentes sur TechPlay.'
            : 'Frequently Asked Questions about TechPlay.'
        }
      />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{locale === 'fr' ? 'FAQ' : 'FAQ'}</h1>
        <ul className="space-y-4">
          <li>
            <b>
              {locale === 'fr'
                ? 'Quand vais-je recevoir ma commande ?'
                : 'When will I receive my order?'}
            </b>
            <p>
              {locale === 'fr'
                ? 'Les commandes sont expédiées sous 24-48h et livrées en 7-15 jours.'
                : 'Orders ship within 24-48h and arrive in 7-15 days.'}
            </p>
          </li>
          <li>
            <b>
              {locale === 'fr'
                ? 'Quels modes de paiement acceptez-vous ?'
                : 'What payment methods do you accept?'}
            </b>
            <p>
              {locale === 'fr'
                ? 'Carte bancaire, Stripe, PayPal, Apple Pay.'
                : 'Credit card, Stripe, PayPal, Apple Pay.'}
            </p>
          </li>
          {/* ... Ajoute plus de FAQ selon besoin ... */}
        </ul>
      </div>
    </>
  );
}
