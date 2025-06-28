// ✅ /src/components/RecentlyViewed.js (bonus : section produits vus)
'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setItems(arr.reverse());
    } catch {}
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-10">
      <h3 className="text-xl font-semibold mb-2">Vu récemment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
