'use client';

import { useEffect, useState } from 'react';

import ProductCard from './ProductCard';

import type { Product } from '@/types/product';

import { useCart } from '@/hooks/useCart';

export default function UpsellProducts() {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    if (!cart.length) return;

    const categoryCounts: Record<string, number> = {};
    cart.forEach((item) => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    const mainCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!mainCategory) return;

    const excludeIds = cart.map((item) => item._id).join(',');

    fetch(`/api/products/recommendations?category=${mainCategory}&excludeIds=${excludeIds}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Product[]) => setRecommendations(Array.isArray(data) ? data : []))
      .catch(() => setRecommendations([]));
  }, [cart]);

  if (!recommendations.length) return null;

  return (
    <section className="card rhythm-content card-padding rounded-2xl">
      <h2 className="heading-subsection mb-4">
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
