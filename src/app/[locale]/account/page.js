// ✅ src/app/[locale]/account/page.js

import SEOHead from '@/components/SEOHead';

export default function AccountHome({ params }) {
  const { locale } = params;

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Mon compte' : 'My Account'}
        overrideDescription={locale === 'fr'
          ? 'Accédez à votre espace personnel, historique de commandes, informations, etc.'
          : 'Access your personal space, order history, account info, and more.'}
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'fr' ? 'Mon compte' : 'My Account'}
        </h1>
        <ul className="space-y-2">
          <li>
            <a
              href={`/${locale}/account/commande`}
              className="text-blue-600 hover:underline"
            >
              {locale === 'fr'
                ? 'Voir mes commandes'
                : 'View my orders'}
            </a>
          </li>
          {/* Ajoute ici d’autres liens utiles si besoin */}
        </ul>
      </div>
    </>
  );
}
