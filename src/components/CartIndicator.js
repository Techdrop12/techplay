'use client';

import { useCart } from '@/context/cartContext';
import { useContext } from 'react';
import { CartAnimationContext } from '@/context/cartAnimationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartIndicator() {
  const { cart } = useCart();
  const { animating } = useContext(CartAnimationContext);
  const router = useRouter();

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        key="cart-indicator"
        type="button"
        className="fixed bottom-6 right-5 z-50 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        initial={{ scale: 1 }}
        animate={
          animating
            ? { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onClick={() => router.push('/panier')}
        aria-label={`Panier : ${totalItems} article${totalItems > 1 ? 's' : ''}`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full shadow">
          {totalItems}
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
