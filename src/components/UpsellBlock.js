// ✅ /src/components/UpsellBlock.js (bonus upsell/cross-sell)
'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function UpsellBlock({ productId, category }) {
  const [upsell, setUpsell] = useState([]);

  useEffect(() => {
    if (!category) return;
    fetch(`/api/products/recommendations?category=${category}&excludeIds=${productId}`)
      .then(res => res.json())
      .then(data => setUpsell(data));
  }, [category, productId]);

  if (!upsell.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">
        Complétez votre achat :
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {upsell.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </div>
  );
}
