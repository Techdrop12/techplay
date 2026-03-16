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
    <section
      className="rhythm-content overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 card-padding dark:bg-[hsl(var(--surface))]/40"
      aria-labelledby="upsell-title"
    >
      <h2 id="upsell-title" className="mb-1 text-xl font-bold text-[hsl(var(--text))]">
        Les clients ont aussi aimé
      </h2>
      <p className="mb-4 text-[13px] text-token-text/70">
        Complétez votre panier avec ces produits populaires
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {upsell.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </section>
  );
}
