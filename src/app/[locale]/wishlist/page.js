'use client';

import { useEffect, useState, useCallback } from 'react';
import { getWishlist, toggleWishlistItem } from '@/lib/wishlist';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWishlist = useCallback(() => {
    try {
      const saved = getWishlist();
      setWishlist(saved || []);
    } catch (err) {
      console.warn('Erreur lecture wishlist :', err);
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Sync cross-tab
  useEffect(() => {
    const handler = () => loadWishlist();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [loadWishlist]);

  // Load products matching wishlist _ids
  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Erreur chargement produits');
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter((p) =>
          wishlist.some((w) => w._id === p._id)
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error('Erreur chargement produits :', err);
        setError(t('error_loading_products') || 'Erreur chargement produits');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [wishlist, t]);

  // Remove item handler
  const handleRemove = (product) => {
    toggleWishlistItem(product);
    loadWishlist();
  };

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
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-56 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"
              />
            ))}
          </motion.div>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : products.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 text-center"
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
                onRemove={() => handleRemove(product)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
