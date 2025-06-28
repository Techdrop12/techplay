'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CartReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCart = window.localStorage.getItem('cart');
        if (storedCart && JSON.parse(storedCart).length > 0) {
          const timer = setTimeout(() => setShow(true), 7000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn('Erreur CartReminder (localStorage) :', e);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-5 right-5 z-50 bg-white dark:bg-zinc-900 text-sm border border-gray-200 dark:border-zinc-700 shadow-xl rounded-2xl px-4 py-3 w-[270px] md:w-[300px]"
      onClick={() => setShow(false)}
      role="alert"
      tabIndex={0}
      aria-label="Rappel panier"
      onKeyDown={(e) => e.key === 'Enter' && setShow(false)}
    >
      <p className="text-gray-800 dark:text-gray-100 font-medium">
        🛒 Vous avez un panier en attente !
      </p>
      <Link
        href="/panier"
        className="block mt-2 text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition"
      >
        Voir mon panier →
      </Link>
    </motion.div>
  );
}
