// ✅ /src/components/CartAbandonTrigger.js (déclencheur relance email panier abandonné, bonus conversion)
'use client';

import { useEffect } from 'react';

export default function CartAbandonTrigger({ email, cart }) {
  useEffect(() => {
    if (!email || !cart?.length) return;
    const timer = setTimeout(() => {
      fetch('/api/brevo/abandon-panier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cart }),
      });
    }, 60000 * 30); // 30 min d'inactivité

    return () => clearTimeout(timer);
  }, [email, cart]);

  return null;
}
