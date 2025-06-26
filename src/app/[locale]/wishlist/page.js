// ✅ src/app/[locale]/wishlist/page.js

'use client';
import { useEffect, useState } from 'react';
import SEOHead from '@/components/SEOHead';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage({ params }) {
  const { locale } = params;
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(saved);
    }
  }, []);

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Ma wishlist' : 'My Wishlist'}
        overrideDescription={
          locale === 'fr'
            ? 'Retrouvez vos produits favoris TechPlay.'
            : 'Find your favorite TechPlay products.'
        }
      />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Ma wishlist' : 'My Wishlist'}
        </h1>
        {wishlist.length === 0 ? (
          <p className="text-gray-600">
            {locale === 'fr'
              ? 'Aucun produit dans votre wishlist.'
              : 'No products in your wishlist.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
