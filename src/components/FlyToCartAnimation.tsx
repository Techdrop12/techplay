'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

interface FlyToCartAnimationProps {
  trigger: unknown;
}

export default function FlyToCartAnimation({ trigger }: FlyToCartAnimationProps) {
  const t = useTranslations('common');
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
          className="fixed z-50 right-8 bottom-16 w-14 h-14 flex items-center justify-center bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] rounded-full shadow-[var(--shadow-lg)]"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.8 }}
        >
          <span role="img" aria-label={t('added_to_cart_aria')}>
            🛒
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
