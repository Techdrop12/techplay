// ✅ src/components/RecentlyViewed.js

'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem('recentlyViewed');
    if (!data) return;
    setProducts(JSON.parse(data));
  }, []);

  if (!products.length) return null;
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold mb-2">Vu récemment</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
