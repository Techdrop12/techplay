'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useRef, type ReactNode } from 'react';

interface PageTransitionsProps {
  children: ReactNode;
}

export default function PageTransitions({ children }: PageTransitionsProps) {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  const isInitial = isFirstMount.current;
  if (isFirstMount.current && pathname) {
    isFirstMount.current = false;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={isInitial ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
