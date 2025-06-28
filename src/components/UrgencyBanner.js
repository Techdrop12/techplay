// ✅ /src/components/UrgencyBanner.js (bonus : bannière d'urgence conversion)
'use client';

import { useEffect, useState } from 'react';

export default function UrgencyBanner({ message }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Masquer après 30s
    const timer = setTimeout(() => setShow(false), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="bg-red-600 text-white text-center py-2 px-4 font-bold">
      {message || '⚡ Offre limitée : livraison gratuite dès 49 € !'}
    </div>
  );
}
