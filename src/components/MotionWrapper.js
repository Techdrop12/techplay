// ✅ src/components/MotionWrapper.js

'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function MotionWrapper({ children, keyId }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
