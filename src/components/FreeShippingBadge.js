'use client';

import { motion } from 'framer-motion';

export default function FreeShippingBadge({ price }) {
  const threshold = 49;

  if (price < threshold) {
    const remaining = (threshold - price).toFixed(2);
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-600 mt-1 font-semibold animate-pulse"
        role="alert"
      >
        Plus que <strong>{remaining} €</strong> pour la livraison gratuite !
      </motion.p>
    );
  }

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-sm text-green-600 mt-1 font-semibold"
      role="status"
      aria-live="polite"
    >
      ✅ Livraison gratuite !
    </motion.p>
  );
}
