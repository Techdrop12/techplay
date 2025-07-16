'use client';

import { useEffect, useState } from 'react';

export default function CartReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) {
      const timer = setTimeout(() => setShow(true), 60000); // 1 minute delay
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg cursor-pointer animate-fadeIn">
      Vous avez des articles dans votre panier 🛒
    </div>
  );
}
