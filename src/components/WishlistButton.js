'use client';

import { useEffect, useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { logEvent } from '@/lib/logEvent';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function WishlistButton({ product, floating = true }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const STORAGE_KEY = 'wishlist';
  const productId = product?._id;

  useEffect(() => {
    if (typeof window === 'undefined' || !productId) return;

    const checkWishlist = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) || '[]';
        const wishlist = JSON.parse(stored);
        setIsWishlisted(wishlist.some((p) => p._id === productId));
      } catch {
        setIsWishlisted(false);
      }
    };

    checkWishlist();
    window.addEventListener('storage', checkWishlist);
    return () => window.removeEventListener('storage', checkWishlist);
  }, [productId]);

  const toggleWishlist = () => {
    if (typeof window === 'undefined' || !productId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY) || '[]';
      let wishlist = JSON.parse(stored);

      if (isWishlisted) {
        wishlist = wishlist.filter((p) => p._id !== productId);
        toast.success('💔 Produit retiré de la wishlist');
        logEvent('wishlist_remove', { productId });
      } else {
        wishlist.unshift(product);
        wishlist = wishlist.slice(0, 20);
        toast.success('❤️ Produit ajouté à la wishlist');
        logEvent('wishlist_add', { productId });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
      setIsWishlisted(!isWishlisted);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('Erreur update wishlist :', err);
      toast.error("Erreur lors de la mise à jour de la wishlist");
    }
  };

  return (
    <motion.button
      onClick={toggleWishlist}
      whileTap={{ scale: 0.85 }}
      className={
        floating
          ? 'absolute top-2 right-2 p-1 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
          : 'text-red-600 hover:text-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-500'
      }
      aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      aria-pressed={isWishlisted}
      title={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      role="button"
      tabIndex={0}
      aria-live="polite"
    >
      {isWishlisted ? (
        <HeartOff
          size={20}
          className="text-red-500"
          fill="currentColor"
          stroke="currentColor"
          aria-hidden="true"
        />
      ) : (
        <Heart
          size={20}
          className="text-gray-600"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}
