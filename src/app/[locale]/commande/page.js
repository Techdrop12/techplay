import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import CheckoutFormClient from '@/components/CheckoutFormClient';

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

// Forcer rendu dynamique car panier évolue en temps réel
export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params: { locale } }) {
  if (!['fr', 'en'].includes(locale)) {
    return notFound();
  }

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return notFound();
  }

  const namespace = messages['commande'] || {};
  const t = (key) => namespace[key] ?? key;

  return (
    <>
      <SEOHead
        titleKey="checkout_title"
        descriptionKey="checkout_description"
      />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <CheckoutFormClient locale={locale} t={t} />
      </div>
    </>
  );
}
