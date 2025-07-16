'use client';

import { useEffect, useState } from 'react';

export default function ShippingSimulator() {
  const [days, setDays] = useState(3);

  useEffect(() => {
    const d = Math.floor(Math.random() * 4) + 2;
    setDays(d);
  }, []);

  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
      📦 Livraison estimée sous <strong>{days}</strong> jours
    </p>
  );
}
