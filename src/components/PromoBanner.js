'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PromoBanner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-yellow-400 text-black text-sm text-center py-2 px-4 fixed top-0 left-0 right-0 z-50 shadow-md"
    >
      🎁 Offre de lancement : -10% avec le code <strong>TECH10</strong> !
    </motion.div>
  )
}
