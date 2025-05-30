// src/lib/abTestVariants.js
'use client'

export const getUserVariant = () => {
  if (typeof window === 'undefined') return 'A'

  const cached = localStorage.getItem('ab_variant')
  if (cached) return cached

  const variants = ['A', 'B', 'C']
  const assigned = variants[Math.floor(Math.random() * variants.length)]
  localStorage.setItem('ab_variant', assigned)
  return assigned
}
