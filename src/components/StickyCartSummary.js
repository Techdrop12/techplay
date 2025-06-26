// ✅ src/components/StickyCartSummary.js

'use client';

import { useCart } from '@/context/cartContext';

export default function StickyCartSummary() {
  const { cart, total } = useCart();

  if (!cart?.length) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-700 text-white p-4 flex justify-between items-center z-40 shadow-lg">
      <span>{cart.length} article{cart.length > 1 ? 's' : ''} — {total.toFixed(2)} €</span>
      <a href="/panier" className="bg-white text-blue-700 rounded px-3 py-2 font-bold ml-4">
        Voir le panier
      </a>
    </div>
  );
}
