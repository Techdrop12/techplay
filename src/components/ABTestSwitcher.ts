'use client'

import { useEffect, useState } from 'react'

import type { ReactNode } from 'react'

import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'

interface ABTestSwitcherProps {
  testKey?: string
  variants?: string[]
  ttlDays?: number
  children: (variant: string) => ReactNode
}

export default function ABTestSwitcher({
  testKey = 'main_test',
  variants = ['A', 'B'],
  ttlDays = 90,
  children,
}: ABTestSwitcherProps) {
  const [variant, setVariant] = useState<string | null>(null)

  useEffect(() => {
    const v = getABVariant(testKey, variants, { ttlDays, allowUrlOverride: true })
    setVariant(v)
    try {
      pushDataLayer({ event: 'ab_assign', ab_name: testKey, ab_variant: v })
      logEvent('ab_assign', { ab_name: testKey, ab_variant: v })
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for assignment
  }, [testKey])

  if (!variant) return null
  return typeof children === 'function' ? children(variant) : null
}
