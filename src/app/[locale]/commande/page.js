// File: src/app/[locale]/commande/page.js

import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import CheckoutFormClient from '@/components/CheckoutFormClient';

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' }
  ];
}

// On force le rendu dynamique parce que le panier/checkout évolue en temps réel
export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params: { locale } }) {
  // 1) Si la locale n’est pas "fr" ni "en", on renvoie 404
  if (!['fr', 'en'].includes(locale)) {
    return notFound();
  }

  // 2) Charger dynamiquement le fichier de traductions correspondant
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return notFound();
  }

  // 3) Extraire le namespace "commande"
  const namespace = messages['commande'] || {};
  const t = (key) => namespace[key] ?? key;

  return (
    <>
      {/* SEOHead utilisera le namespace "seo" + "checkout_title"/"checkout_description" */}
      <SEOHead
        titleKey="checkout_title"
        descriptionKey="checkout_description"
      />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">
          {t('title')}
        </h1>

        {/* Le composant client où toute la logique "panier + Stripe" se fera */}
        <CheckoutFormClient locale={locale} t={t} />
      </div>
    </>
  );
}
