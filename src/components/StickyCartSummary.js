// ✅ /src/components/StickyCartSummary.js (bonus résumé panier sticky)
'use client';

import { useCart } from '@/context/cartContext';

export default function StickyCartSummary() {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-600 text-white py-3 px-4 flex justify-between items-center z-40 shadow-lg">
      <span>Panier ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
      <span className="font-bold">{total.toFixed(2)} €</span>
      <a
        href="/fr/panier"
        className="bg-white text-blue-700 px-3 py-2 rounded font-semibold hover:bg-blue-50 transition"
      >
        Voir le panier
      </a>
    </div>
  );
}
