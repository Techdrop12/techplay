// ✅ /src/components/PromoBanner.js (bannière promo dynamique, bonus conversion)
'use client';

import { useEffect, useState } from 'react';

export default function PromoBanner() {
  const [show, setShow] = useState(true);

  // Exemple de promo : voir pour dynamique plus tard
  const promo = {
    message: '🚀 -10% sur tout avec le code TECH10 !',
    url: '/fr/produit',
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center p-2 font-medium shadow-md">
      <a href={promo.url} className="hover:underline">
        {promo.message}
      </a>
      <button
        className="absolute right-4 top-1 text-white"
        aria-label="Fermer"
        onClick={() => setShow(false)}
      >
        ×
      </button>
    </div>
  );
}
