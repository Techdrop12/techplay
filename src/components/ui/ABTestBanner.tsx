'use client'

import { useEffect, useMemo, useState } from 'react'

import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'

type Props = {
  name?: string
  variants?: string[]
  ttlDays?: number
  labels?: Record<string, string>
  className?: string
}

export default function ABTestBanner({
  name = 'banner',
  variants,
  ttlDays = 90,
  labels,
  className,
}: Props) {
  const [variant, setVariant] = useState<string | null>(null)

  const resolvedVariants = useMemo(
    () => (Array.isArray(variants) && variants.length > 0 ? variants : ['A', 'B']),
    [variants]
  )

  useEffect(() => {
    const v = getABVariant(name, resolvedVariants, { ttlDays })
    setVariant(v)

    try {
      pushDataLayer({ event: 'ab_assign', ab_name: name, ab_variant: v })
      logEvent('ab_assign', { ab_name: name, ab_variant: v })
    } catch {}
  }, [name, resolvedVariants, ttlDays])

  const label = useMemo(() => {
    if (!variant) return ''
    return labels?.[variant] ?? variant
  }, [labels, variant])

  if (!variant) return null

  return (
    <div
      className={className ?? 'bg-blue-100 text-blue-800 text-center py-2 text-sm'}
      data-ab-name={name}
      data-ab-variant={variant}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  )
}