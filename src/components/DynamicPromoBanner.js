// ✅ /src/components/DynamicPromoBanner.js (promo selon panier, date…)
'use client';

import { useCart } from '@/context/cartContext';
import { useState, useEffect } from 'react';

export default function DynamicPromoBanner() {
  const { cart } = useCart();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (cart.length >= 1) setMsg('🎁 10 % sur le panier avec le code TECH10 !');
    else setMsg('Livraison offerte dès 49 € d’achat');
  }, [cart]);

  if (!msg) return null;
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 text-center font-bold shadow-sm">
      {msg}
    </div>
  );
}
