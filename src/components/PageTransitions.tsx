'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface PageTransitionsProps {
  children: ReactNode;
}

export default function PageTransitions({ children }: PageTransitionsProps) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const allowEnterTransition = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || allowEnterTransition.current) return;
    const id = requestAnimationFrame(() => {
      allowEnterTransition.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [hydrated]);

  if (!hydrated) {
    return <div style={{ display: 'contents' }}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={allowEnterTransition.current ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
