'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { Product } from '@/types/product';

import Link from '@/components/LocalizedLink';
import { getRecentlyViewed } from '@/lib/recentProducts';
import { safeProductImageUrl } from '@/lib/safeProductImage';

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+';

export default function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const data = getRecentlyViewed({ max: 8 });
    if (Array.isArray(data)) setProducts((data as Product[]).filter(Boolean));
  }, []);

  if (!products.length) return null;

  return (
    <section className="my-12 max-w-6xl mx-auto px-4">
      <h3 className="text-xl font-semibold mb-4">🔁 Vu récemment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.slug || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/products/${p.slug}`}
              className="block border p-2 rounded-lg hover:shadow transition bg-white"
            >
              <div className="relative w-full h-32 mb-2">
                <Image
                  src={safeProductImageUrl(typeof p.image === 'string' ? p.image : undefined)}
                  alt={typeof p.title === 'string' ? p.title : ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              </div>
              <p className="text-sm font-medium line-clamp-2">{p.title ?? ''}</p>
              <p className="text-xs text-token-text/70">
                {typeof p.price === 'number' ? p.price : ''} €
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
