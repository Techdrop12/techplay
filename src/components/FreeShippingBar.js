// ✅ /src/components/FreeShippingBar.js (barre progression livraison gratuite, bonus panier)
'use client';

import { useCart } from '@/context/cartContext';

export default function FreeShippingBar() {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const threshold = 49;

  if (total >= threshold) return null;
  const missing = (threshold - total).toFixed(2);

  return (
    <div className="w-full bg-blue-100 text-blue-800 p-2 text-center text-sm">
      Plus que <span className="font-bold">{missing} €</span> pour profiter de la livraison gratuite !
    </div>
  );
}
