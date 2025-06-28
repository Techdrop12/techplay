'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/cartContext';
import ProductCard from './ProductCard';

export default function UpsellProducts() {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!cart.length) return;

    // Compter les catégories
    const categoryCounts = {};
    cart.forEach(item => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    const mainCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!mainCategory) return;

    const excludeIds = cart.map(item => item._id).join(',');

    fetch(`/api/products/recommendations?category=${mainCategory}&excludeIds=${excludeIds}`)
      .then(res => res.ok ? res.json() : [])
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [cart]);

  if (!recommendations.length) return null;

  return (
    <section className="mt-10 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl shadow-inner">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        🎯 Vous pourriez aussi aimer
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
