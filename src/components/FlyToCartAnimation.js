'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function FlyToCartAnimation({ productImageRef, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!productImageRef?.current) return null;

  const rect = productImageRef.current.getBoundingClientRect();

  return (
    <AnimatePresence>
      <motion.img
        src={productImageRef.current.src}
        alt="Produit ajouté au panier"
        initial={{
          position: 'fixed',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: 12,
          opacity: 1,
          zIndex: 9999,
        }}
        animate={{
          top: 20,
          left: window.innerWidth - 80,
          width: 40,
          height: 40,
          opacity: 0,
          borderRadius: 9999,
          transition: { duration: 0.7, ease: 'easeInOut' },
        }}
        exit={{ opacity: 0 }}
        style={{ pointerEvents: 'none' }}
      />
    </AnimatePresence>
  );
}
