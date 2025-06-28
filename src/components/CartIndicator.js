// ✅ /src/components/CartIndicator.js (badge dynamique panier, bonus UX)
'use client';

import { useCart } from '@/context/cartContext';

export default function CartIndicator() {
  const { cart } = useCart();
  if (!cart.length) return null;
  return (
    <span className="ml-2 inline-block min-w-[20px] bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 text-center font-bold">
      {cart.reduce((acc, item) => acc + (item.qty || 1), 0)}
    </span>
  );
}
