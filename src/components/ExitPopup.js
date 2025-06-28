'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ExitPopup() {
  const [visible, setVisible] = useState(false);
  const [cartHasItems, setCartHasItems] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) setCartHasItems(true);

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && cart.length > 0) {
        setVisible(true);
        document.removeEventListener('mouseout', handleMouseLeave);
        setTimeout(() => setVisible(false), 10000);
      }
    };

    document.addEventListener('mouseout', handleMouseLeave);
    return () => document.removeEventListener('mouseout', handleMouseLeave);
  }, []);

  if (!cartHasItems) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl shadow-xl p-6 w-[90%] max-w-md text-center"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <h2 className="text-xl font-bold mb-2">🛒 Panier en attente</h2>
            <p className="text-sm mb-4">
              Vous avez des articles dans votre panier. Ne partez pas sans les commander !
            </p>
            <Link
              href="/panier"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              Voir mon panier →
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
