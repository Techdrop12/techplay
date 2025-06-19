'use client';

import { useContext } from 'react';
import { CartAnimationContext } from '@/context/cartAnimationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cartContext';

export default function CartIndicator() {
  const { cart } = useCart();
  const { animating } = useContext(CartAnimationContext);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <AnimatePresence>
      <motion.span
        key="cart-indicator"
        className="relative inline-block cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Panier (${totalItems} article${totalItems > 1 ? 's' : ''})`}
        initial={{ scale: 1 }}
        animate={animating ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <ShoppingCart className="w-6 h-6" aria-hidden="true" />
        {totalItems > 0 && (
          <span
            className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full"
            aria-live="polite"
            aria-atomic="true"
          >
            {totalItems}
          </span>
        )}
      </motion.span>
    </AnimatePresence>
  );
}
