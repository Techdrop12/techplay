'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className={cn('py-16 lg:py-24', className)}
    >
      {children}
    </motion.section>
  )
}
