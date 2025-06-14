'use client';

import { useEffect, useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { logEvent } from '@/lib/logEvent';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function WishlistButton({ product, floating = true }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const STORAGE_KEY = 'wishlist';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || '[]';
      const wishlist = JSON.parse(stored);
      const found = wishlist.some((p) => p._id === product._id);
      setIsWishlisted(found);
    } catch (err) {
      console.warn('Erreur lecture wishlist :', err);
    }
  }, [product._id]);

  const toggleWishlist = () => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY) || '[]';
      let wishlist = JSON.parse(stored);

      if (isWishlisted) {
        wishlist = wishlist.filter((p) => p._id !== product._id);
        logEvent('wishlist_remove', { productId: product._id });
        toast.success('Retiré de la wishlist');
      } else {
        wishlist.unshift(product);
        wishlist = wishlist.slice(0, 20); // max 20 éléments
        logEvent('wishlist_add', { productId: product._id });
        toast.success('Ajouté à la wishlist');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.warn('Erreur update wishlist :', err);
    }
  };

  return (
    <motion.button
      onClick={toggleWishlist}
      whileTap={{ scale: 0.9 }}
      className={
        floating
          ? 'absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-white shadow transition'
          : 'text-red-600 hover:text-red-800 transition'
      }
      aria-label={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
    >
      {isWishlisted ? (
        <HeartOff
          size={20}
          className="text-red-500"
          fill="currentColor"
          stroke="currentColor"
        />
      ) : (
        <Heart
          size={20}
          className="text-gray-600"
          fill="none"
          stroke="currentColor"
        />
      )}
    </motion.button>
  );
}
