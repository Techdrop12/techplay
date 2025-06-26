// ✅ src/app/[locale]/panier/page.js

'use client';
import { useCart } from '@/context/cartContext';
import SEOHead from '@/components/SEOHead';
import Cart from '@/components/Cart';

export default function PanierPage({ params }) {
  const { locale } = params;
  const { cart } = useCart();

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Mon panier' : 'My Cart'}
        overrideDescription={
          locale === 'fr'
            ? 'Validez votre panier TechPlay et passez commande.'
            : 'Review your TechPlay cart and proceed to checkout.'
        }
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Mon panier' : 'My Cart'}
        </h1>
        <Cart locale={locale} />
      </div>
    </>
  );
}
