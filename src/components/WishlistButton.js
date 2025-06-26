// ✅ src/components/WishlistButton.js

'use client';

import { useWishlist } from '@/context/wishlist';
import { motion } from 'framer-motion';

export default function WishlistButton({ product }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const isWished = wishlist.some((p) => p._id === product._id);

  return (
    <motion.button
      className={`rounded-full px-3 py-1 border font-semibold shadow transition
        ${isWished ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-gray-50 border-gray-300 text-gray-700'}
      `}
      whileTap={{ scale: 0.9 }}
      onClick={() => toggleWishlist(product)}
      aria-label={isWished ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
    >
      {isWished ? '♥' : '♡'}
    </motion.button>
  );
}
