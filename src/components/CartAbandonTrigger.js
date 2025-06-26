// ✅ src/components/CartAbandonTrigger.js

'use client';

import { useEffect } from 'react';

export default function CartAbandonTrigger({ email, cart }) {
  useEffect(() => {
    if (!cart?.length || !email) return;
    const timer = setTimeout(() => {
      fetch('/api/brevo/abandon-panier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cart }),
      });
    }, 1000 * 60 * 30); // 30 minutes
    return () => clearTimeout(timer);
  }, [cart, email]);

  return null;
}
