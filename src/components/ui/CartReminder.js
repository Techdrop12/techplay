'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/cartContext';

export default function CartReminder() {
  const { cart } = useCart();

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('techplay_last_cart', JSON.stringify(cart));
    }
  }, [cart]);

  return null;
}
