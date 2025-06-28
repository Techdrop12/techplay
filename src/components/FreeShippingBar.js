'use client';

import { useCart } from '@/context/cartContext';
import { useEffect, useState } from 'react';

export default function FreeShippingBar({ threshold = 49 }) {
  const { cart } = useCart();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const totalAmount = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    setTotal(totalAmount);
  }, [cart]);

  if (total >= threshold || cart.length === 0) return null;

  const remaining = (threshold - total).toFixed(2);
  const progress = Math.min((total / threshold) * 100, 100);

  return (
    <div className="w-full bg-gray-100 border-b border-gray-300 text-center text-sm font-medium py-2 px-4 shadow-sm animate-pulse">
      <div className="mb-1">
        Plus que <span className="text-blue-600 font-semibold">{remaining} €</span> pour la livraison gratuite 🚚
      </div>
      <div className="w-full h-2 bg-gray-300 rounded overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
