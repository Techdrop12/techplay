// ✅ src/components/PromoBanner.js

'use client';

import { useEffect, useState } from 'react';

const banners = [
  { text: "⚡️ Livraison gratuite dès 50€ !", bg: "bg-green-600" },
  { text: "🔥 Promo : -10% sur tout, code WELCOME10", bg: "bg-orange-500" },
  { text: "🎉 Découvrez notre nouveau blog TechPlay", bg: "bg-blue-600" },
];

export default function PromoBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % banners.length), 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full text-white text-center py-2 ${banners[idx].bg} transition-colors duration-300`}>
      {banners[idx].text}
    </div>
  );
}
