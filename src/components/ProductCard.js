'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cartContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ReactStars from 'react-rating-stars-component';
import { logEvent } from '@/lib/logEvent';
import { getUserVariant } from '@/lib/abTestVariants';
import WishlistButton from '@/components/WishlistButton';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [variant, setVariant] = useState('A');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const v = getUserVariant();
    setVariant(v);
    logEvent('ab_variant_view', {
      variant: v,
      item_name: product.title,
    });
  }, [product.title]);

  const handleAdd = () => {
    setIsLoading(true);
    addToCart(product);
    toast.success(`✅ ${product.title} ajouté au panier`);

    logEvent('add_to_cart', {
      item_id: product._id,
      item_name: product.title,
      price: product.price,
      variant,
    });

    if (variant === 'B') {
      setTimeout(() => {
        router.push('/panier');
      }, 600);
    } else {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  return (
    <motion.div
      className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
      role="group"
      aria-label={`Produit ${product.title}`}
    >
      {product.isPromo && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          Promo
        </div>
      )}

      <div
        onClick={() => router.push(`/produit/${product.slug}`)}
        className="cursor-pointer"
        tabIndex={0}
        role="button"
        aria-label={`Voir le produit ${product.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            router.push(`/produit/${product.slug}`);
          }
        }}
      >
        <Image
          src={product.image}
          alt={product.title}
          width={400}
          height={400}
          className="w-full h-64 object-contain rounded-xl"
          priority
        />
        <h3 className="mt-2 font-semibold text-lg truncate">{product.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{product.price} €</p>
        <ReactStars
          count={5}
          value={product.rating || 4.5}
          size={20}
          isHalf
          edit={false}
          activeColor="#ffd700"
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg transition-colors font-medium text-white ${
            isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
          aria-label={`Ajouter ${product.title} au panier`}
        >
          {isLoading ? 'Ajout...' : 'Ajouter au panier'}
        </button>
        <WishlistButton product={product} />
      </div>
    </motion.div>
  );
}
