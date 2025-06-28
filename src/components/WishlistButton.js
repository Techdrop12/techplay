// ✅ /src/components/WishlistButton.js (bouton wishlist dynamique bonus)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WishlistButton({ product }) {
  const [inWishlist, setInWishlist] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!product?._id) return;
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setInWishlist(list.some((p) => p._id === product._id));
  }, [product]);

  const toggleWishlist = () => {
    if (!product?._id) return;
    let list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (inWishlist) {
      list = list.filter((p) => p._id !== product._id);
    } else {
      list.push(product);
    }
    localStorage.setItem('wishlist', JSON.stringify(list));
    setInWishlist(!inWishlist);
    router.refresh?.();
  };

  return (
    <button
      className={`ml-2 text-xl transition ${inWishlist ? 'text-pink-600' : 'text-gray-400 hover:text-pink-500'}`}
      title={inWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      aria-pressed={inWishlist}
      onClick={toggleWishlist}
    >
      {inWishlist ? '❤️' : '🤍'}
    </button>
  );
}
