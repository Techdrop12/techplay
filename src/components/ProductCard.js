'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cartContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactStars from 'react-rating-stars-component';
import { logEvent } from '@/lib/logEvent';
import { getUserVariant } from '@/lib/abTestVariants';
import WishlistButton from '@/components/WishlistButton';
import FreeShippingBadge from '@/components/FreeShippingBadge';
import { CartAnimationContext } from '@/context/cartAnimationContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { triggerCartAnimation } = useContext(CartAnimationContext);
  const [variant, setVariant] = useState('A');
  const [isLoading, setIsLoading] = useState(false);
  const [flyAnim, setFlyAnim] = useState(false);
  const cardRef = useRef(null);

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
    setFlyAnim(true);
    addToCart(product);
    toast.success(`✅ ${product.title} ajouté au panier`);

    logEvent('add_to_cart', {
      item_id: product._id,
      item_name: product.title,
      price: product.price,
      variant,
    });

    triggerCartAnimation();

    setTimeout(() => {
      setFlyAnim(false);
      setIsLoading(false);
      if (variant === 'B') {
        router.push('/panier');
      }
    }, 800);
  };

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <motion.div
      ref={cardRef}
      className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
      role="group"
      aria-label={`Produit ${product.title}`}
    >
      {discount && (
        <div
          className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-20"
          aria-label={`Promotion : -${discount}%`}
          title={`-${discount}% de réduction`}
        >
          -{discount}%
        </div>
      )}

      <div
        onClick={() => router.push(`/produit/${product.slug}`)}
        className="cursor-pointer outline-none"
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

        <div className="flex items-center gap-2">
          <p className="text-gray-600 dark:text-gray-300 text-lg font-bold">
            {product.price.toFixed(2)} €
          </p>
          {product.oldPrice && (
            <p className="text-gray-400 line-through text-sm">
              {product.oldPrice.toFixed(2)} €
            </p>
          )}
        </div>

        <ReactStars
          count={5}
          value={product.rating || 4.5}
          size={20}
          isHalf
          edit={false}
          activeColor="#ffd700"
          aria-label={`Note : ${product.rating || 4.5} étoiles`}
        />

        <FreeShippingBadge price={product.price} />
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          aria-live="polite"
          aria-busy={isLoading}
          className={`px-4 py-2 rounded-lg transition-colors font-medium text-white ${
            isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
          aria-label={`Ajouter ${product.title} au panier`}
        >
          {isLoading ? 'Ajout...' : 'Ajouter au panier'}
        </button>
        <WishlistButton product={product} />
      </div>

      <AnimatePresence>
        {flyAnim && (
          <motion.div
            initial={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 0.3,
              y: -200,
              x: 200,
              rotate: 360,
              transition: { duration: 0.8, ease: 'easeInOut' },
            }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-4 pointer-events-none z-50"
          >
            <Image
              src={product.image}
              alt=""
              width={100}
              height={100}
              className="object-contain rounded"
              aria-hidden="true"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
