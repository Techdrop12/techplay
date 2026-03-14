// src/components/ProductTags.tsx
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
    soft: 'bg-[hsl(var(--surface-2))] text-token-text/85',
    solid: 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]',
    ghost: 'border border-[hsl(var(--border))] text-token-text/70',
  }

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
          key={index}
          role="listitem"
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
