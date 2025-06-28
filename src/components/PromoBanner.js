'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const promos = [
  {
    text: '🎁 Livraison gratuite ce soir jusqu’à minuit !',
    url: '/fr/produit',
    bg: 'bg-green-600',
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 18 && hour <= 23;
    },
  },
  {
    text: '🚚 Livraison rapide sur tous les produits TechPlay !',
    url: '/fr/categorie',
    bg: 'bg-blue-700',
  },
  {
    text: '⭐ Offres limitées sur nos best-sellers high-tech !',
    url: '/fr/categorie/best-sellers',
    bg: 'bg-orange-500',
  },
];

export default function PromoBanner() {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const eligible = promos.filter((p) => !p.condition || p.condition());
    if (eligible.length > 0) {
      const random = Math.floor(Math.random() * eligible.length);
      setCurrent(eligible[random]);
    }

    const autoClose = setTimeout(() => setVisible(false), 12000);
    return () => clearTimeout(autoClose);
  }, []);

  if (!visible || !current) return null;

  return (
    <div className={`${current.bg} text-white text-sm text-center py-2 px-4 font-medium shadow-md relative z-40`}>
      <Link href={current.url} className="hover:underline block">
        {current.text}
      </Link>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1 text-white text-lg font-bold"
        aria-label="Fermer la bannière promotionnelle"
      >
        ×
      </button>
    </div>
  );
}
