// ✅ /src/components/MotionWrapper.js (wrapper animation page, bonus UX)
'use client';

import { motion } from 'framer-motion';

export default function MotionWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
