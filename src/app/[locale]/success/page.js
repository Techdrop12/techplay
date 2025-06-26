// ✅ src/app/[locale]/success/page.js

import SEOHead from '@/components/SEOHead';

export default function SuccessPage({ params, searchParams }) {
  const { locale } = params;
  const orderId = searchParams?.orderId;

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Commande réussie' : 'Order Successful'}
        overrideDescription={
          locale === 'fr'
            ? 'Merci pour votre commande sur TechPlay !'
            : 'Thank you for your order on TechPlay!'
        }
        noIndex
      />
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <svg width={60} height={60} fill="none" className="mb-6" viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={12} fill="#34d399" />
          <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="text-2xl font-bold mb-2 text-green-700">
          {locale === 'fr'
            ? 'Merci pour votre commande !'
            : 'Thank you for your order!'}
        </h1>
        <p className="text-gray-600 mb-2">
          {locale === 'fr'
            ? "Votre commande a bien été prise en compte."
            : "Your order has been received."}
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-4">
            {locale === 'fr'
              ? `Numéro de commande : ${orderId}`
              : `Order number: ${orderId}`}
          </p>
        )}
        <a
          href={`/${locale}/mes-commandes`}
          className="text-blue-600 hover:underline font-semibold mt-2"
        >
          {locale === 'fr'
            ? 'Voir mes commandes'
            : 'View my orders'}
        </a>
      </div>
    </>
  );
}
