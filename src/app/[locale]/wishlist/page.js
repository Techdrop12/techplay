'use client';

import { useEffect, useState } from 'react';
import { getWishlist } from '@/lib/wishlist';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charge la wishlist depuis localStorage
  const loadWishlist = () => {
    try {
      const saved = getWishlist();
      setWishlist(saved || []);
    } catch (err) {
      console.warn('Erreur lecture wishlist :', err);
      setWishlist([]);
    }
  };

  // 1. Initialisation
  useEffect(() => {
    loadWishlist();
  }, []);

  // 2. Synchronisation avec localStorage en cas de modification ailleurs
  useEffect(() => {
    const handler = () => loadWishlist();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // 3. Filtrage des produits correspondants
  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      return;
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p) =>
          wishlist?.some((w) => w._id === p._id)
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error('Erreur chargement produits :', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <>
      <SEOHead
        titleKey="wishlist_title"
        descriptionKey="wishlist_description"
      />

      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-56 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"
              />
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            {t('empty')}
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showRemoveFromWishlist
              />
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
