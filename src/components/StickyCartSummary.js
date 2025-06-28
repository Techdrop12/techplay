'use client';

import { useCart } from '@/context/cartContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StickyCartSummary({ locale = 'fr' }) {
  const { cart } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(cart.length > 0);
  }, [cart]);

  if (!visible) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const linkHref = `/${locale}/panier`;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-4 py-3 flex justify-between items-center shadow-lg md:hidden animate-fade-in"
      role="complementary"
      aria-label="Résumé du panier"
    >
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        🛒 {itemCount} article{itemCount > 1 ? 's' : ''} – <span className="font-bold">{total} €</span>
      </div>
      <Link
        href={linkHref}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        Voir le panier
      </Link>
    </div>
  );
}
