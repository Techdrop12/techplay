// ✅ /src/app/[locale]/wishlist/page.js (wishlist client, UX)
'use client';

import WishlistButton from '@/components/WishlistButton';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';
import { useEffect, useState } from 'react';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(data);
    }
  }, []);

  return (
    <>
      <SEOHead
        overrideTitle="Votre wishlist TechPlay"
        overrideDescription="Retrouvez tous les produits que vous avez ajoutés à votre liste d’envies TechPlay."
      />
      <main className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Votre Wishlist</h1>
        {wishlist.length === 0 ? (
          <p className="text-gray-600">Votre wishlist est vide.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
