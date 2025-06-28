// ✅ /src/components/CartReminder.js (popin relance panier, bonus conversion)
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/cartContext';

export default function CartReminder() {
  const { cart } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (cart.length === 0) return;
    const timer = setTimeout(() => setShow(true), 1000 * 60 * 10); // 10 minutes
    return () => clearTimeout(timer);
  }, [cart]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white border shadow-xl rounded p-6 flex flex-col items-center animate-fadeIn">
      <span className="font-semibold mb-2">
        🛒 Votre panier vous attend&nbsp;!
      </span>
      <a
        href="/fr/panier"
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 mt-2"
      >
        Voir mon panier
      </a>
      <button onClick={() => setShow(false)} className="text-xs text-gray-400 mt-2">
        Fermer
      </button>
    </div>
  );
}
