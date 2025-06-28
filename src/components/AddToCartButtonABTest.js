'use client';

import { useEffect, useState } from 'react';
import { logEvent } from '@/lib/logEvent';

export default function AddToCartButtonABTest({ onClick, product, userEmail, locale = 'fr' }) {
  const [variant, setVariant] = useState('A');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ab_variant');
      if (stored && ['A', 'B'].includes(stored)) {
        setVariant(stored);
      } else {
        const random = Math.random() < 0.5 ? 'A' : 'B';
        localStorage.setItem('ab_variant', random);
        setVariant(random);
      }
    } catch (e) {
      console.warn('Erreur lecture A/B test :', e);
    }
  }, []);

  const handleClick = () => {
    if (typeof window === 'undefined') return;

    try {
      const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const already = currentCart.find((item) => item._id === product._id);

      const updatedCart = already
        ? currentCart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...currentCart, { ...product, quantity: 1 }];

      localStorage.setItem('cartItems', JSON.stringify(updatedCart));

      if (userEmail) {
        localStorage.setItem('cartEmail', userEmail);
      }
    } catch (e) {
      console.warn('Erreur localStorage panier (A/B) :', e);
    }

    // Tracking API
    fetch('/api/track-ab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant,
        event: 'add_to_cart',
        productId: product?._id || product?.id || null,
      }),
    });

    // Analytics
    logEvent('add_to_cart_ab_test', {
      variant,
      productId: product?._id || product?.id || null,
    });

    // Redirection si variant B
    if (variant === 'B') {
      window.location.href = `/${locale}/commande`;
    }

    if (typeof onClick === 'function') onClick();
  };

  const label =
    variant === 'A'
      ? locale === 'fr'
        ? 'Ajouter au panier'
        : 'Add to cart'
      : locale === 'fr'
      ? '🛒 Commander maintenant'
      : '🛒 Buy now';

  const bgColor = variant === 'A' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-2 rounded shadow text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${bgColor}`}
      aria-label={label}
      title={label}
      role="button"
    >
      {label}
    </button>
  );
}
