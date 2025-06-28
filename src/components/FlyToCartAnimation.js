// ✅ /src/components/FlyToCartAnimation.js (bonus micro-animation UX panier)
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function FlyToCartAnimation({ trigger }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setTimeout(() => setShow(false), 900);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed z-50 right-8 bottom-16 w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.8 }}
        >
          <span role="img" aria-label="Ajouté au panier">
            🛒
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
