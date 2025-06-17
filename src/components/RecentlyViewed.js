'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('recentlyViewed');
      const parsed = stored ? JSON.parse(stored) : [];
      setRecentlyViewed(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.warn('Erreur lecture recentlyViewed:', e);
      setRecentlyViewed([]);
    }
  }, []);

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Produits récemment consultés</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recentlyViewed.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
