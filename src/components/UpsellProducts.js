// ✅ /src/components/UpsellProducts.js (bonus : upsell sur page panier)
'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function UpsellProducts({ cart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!cart?.length) return;
    fetch(`/api/products/recommendations?excludeIds=${cart.map(i => i._id).join(',')}`)
      .then(res => res.json())
      .then(setProducts);
  }, [cart]);

  if (!products.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-3">Ils pourraient aussi vous plaire</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
