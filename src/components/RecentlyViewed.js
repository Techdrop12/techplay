'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const viewed = localStorage.getItem('recentlyViewed');
    if (viewed) {
      setProducts(JSON.parse(viewed));
    }
  }, []);

  if (!products.length) return null;

  return (
    <div className="my-6 p-4 border rounded shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3">🔁 Produits récemment vus</h3>
      <div className="flex flex-wrap gap-4">
        {products.map((p) => (
          <Link key={p.slug} href={`/fr/produit/${p.slug}`} className="text-blue-600 hover:underline text-sm">
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
