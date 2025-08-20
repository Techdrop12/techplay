'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductTagsProps {
  tags?: string[]
  variant?: 'soft' | 'solid' | 'ghost'
  className?: string
}

export default function ProductTags({
  tags = [],
  variant = 'soft',
  className = '',
}: ProductTagsProps) {
  if (!tags.length) return null

  const base = 'text-xs font-medium px-2 py-1 rounded inline-block transition'
  const variants = {
    soft: 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200',
    solid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    ghost: 'border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-300',
  } as const

  const style = variants[variant] || variants.soft

  return (
    <motion.div
      className={cn('flex flex-wrap gap-2 mt-3', className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="list"
      aria-label="Étiquettes du produit"
    >
      {tags.map((tag, index) => (
        <motion.span
          key={`${tag}-${index}`}
          role="listitem"
          title={tag}
          className={cn(base, style)}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          #{tag}
        </motion.span>
      ))}
    </motion.div>
  )
}
