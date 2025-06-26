// ✅ src/components/CartIndicator.js

'use client';

import { useCart } from '@/context/cartContext';
import Link from 'next/link';

export default function CartIndicator({ locale = 'fr' }) {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (count === 0) return null;

  return (
    <Link
      href={`/${locale}/panier`}
      className="fixed bottom-8 right-6 z-50 flex items-center px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg font-bold text-lg animate-bounce hover:scale-105 transition"
      aria-label="Aller au panier"
    >
      🛒 <span className="ml-2">{count}</span>
    </Link>
  );
}
