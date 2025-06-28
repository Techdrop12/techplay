// ✅ /src/components/ProductCard.js (carte produit, UX, wishlist, stars, animation)
'use client';

import Image from 'next/image';
import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cartContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import WishlistButton from '@/components/WishlistButton';

export default function ProductCard({ product, variant }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.title} ajouté au panier`);
  };

  return (
    <motion.div
      className="border rounded-lg shadow-sm bg-white p-4 flex flex-col hover:shadow-lg transition group"
      whileHover={{ y: -2, scale: 1.03 }}
    >
      <div className="relative mb-3 w-full aspect-square bg-gray-100 overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className={`object-contain transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadingComplete={() => setImgLoaded(true)}
        />
      </div>
      <h2 className="font-bold text-lg mb-1 group-hover:text-blue-700 transition">{product.title}</h2>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl font-semibold">{product.price?.toFixed(2)} €</span>
        <WishlistButton product={product} />
      </div>
      <button
        className="mt-auto w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
        onClick={handleAdd}
      >
        Ajouter au panier
      </button>
    </motion.div>
  );
}
