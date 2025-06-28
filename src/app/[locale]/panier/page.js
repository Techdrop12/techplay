// ✅ /src/app/[locale]/panier/page.js (panier client, UX, upsell, sticky, skeleton)
'use client';

import { useCart } from '@/context/cartContext';
import Cart from '@/components/Cart';
import SEOHead from '@/components/SEOHead';
import UpsellBlock from '@/components/UpsellBlock';
import StickyCartSummary from '@/components/StickyCartSummary';
import { useState } from 'react';

export default function PanierPage() {
  const { cart, loading } = useCart();
  const [showUpsell, setShowUpsell] = useState(true);

  return (
    <>
      <SEOHead
        overrideTitle="Votre panier"
        overrideDescription="Consultez et validez votre panier TechPlay. Profitez d’offres exclusives et de la livraison offerte !"
      />
      <main className="max-w-4xl mx-auto py-8 px-2 sm:px-0">
        <h1 className="text-2xl font-bold mb-6">Votre panier</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            {loading ? (
              <div className="animate-pulse bg-gray-100 h-40 rounded mb-6" />
            ) : (
              <Cart />
            )}
            {showUpsell && <UpsellBlock onClose={() => setShowUpsell(false)} />}
          </div>
          <div className="md:w-80 w-full">
            <StickyCartSummary />
          </div>
        </div>
      </main>
    </>
  );
}
