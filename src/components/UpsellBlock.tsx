// ✅ /src/components/UpsellBlock.tsx (bonus upsell/cross-sell)
'use client';

import { useEffect, useState } from 'react';

import ProductCard from './ProductCard';

interface UpsellBlockProps {
  productId: string;
  category: string;
}

export default function UpsellBlock({ productId, category }: UpsellBlockProps) {
  const [upsell, setUpsell] = useState<import('@/types/product').Product[]>([]);

  useEffect(() => {
    if (!category) return;
    fetch(`/api/products/recommendations?category=${category}&excludeIds=${productId}`)
      .then((res) => res.json())
      .then((data) => setUpsell(data));
  }, [category, productId]);

  if (!upsell.length) return null;

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 bg-gray-50/50 dark:bg-zinc-900/30" aria-labelledby="upsell-title">
      <h2 id="upsell-title" className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        Les clients ont aussi aimé
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Complétez votre panier avec ces produits populaires</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {upsell.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </section>
  );
}
