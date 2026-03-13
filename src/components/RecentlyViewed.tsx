'use client';

import { useEffect, useState } from 'react';

import Link from '@/components/LocalizedLink';

interface ViewedProduct {
  slug: string;
  title: string;
  [key: string]: unknown;
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('recentlyViewed');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const items = parsed?.items ?? (Array.isArray(parsed) ? parsed : []);
        setProducts(
          Array.isArray(items)
            ? items.map((x: { data?: ViewedProduct }) => x.data ?? x).filter(Boolean) as ViewedProduct[]
            : []
        );
      } catch {}
    }
  }, []);

  if (!products.length) return null;

  return (
    <div className="my-6 p-4 border rounded shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3">🔁 Produits récemment vus</h3>
      <div className="flex flex-wrap gap-4">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/fr/produit/${p.slug}`}
            className="text-blue-600 hover:underline text-sm"
          >
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
