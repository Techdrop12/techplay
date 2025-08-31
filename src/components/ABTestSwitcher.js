// ✅ src/components/ABTestSwitcher.js
'use client'

import { useEffect, useState } from 'react'
import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'

/**
 * @param {{ testKey?: string, variants: string[], ttlDays?: number, children: (v:string)=>any }} props
 */
export default function ABTestSwitcher({ testKey = 'main_test', variants = ['A', 'B'], ttlDays = 90, children }) {
  const [variant, setVariant] = useState(null)

  useEffect(() => {
    const v = getABVariant(testKey, variants, { ttlDays, allowUrlOverride: true })
    setVariant(v)
    // Track assignation (une seule fois)
    try {
      pushDataLayer({ event: 'ab_assign', ab_name: testKey, ab_variant: v })
      logEvent('ab_assign', { ab_name: testKey, ab_variant: v })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testKey])

  if (!variant) return null
  return typeof children === 'function' ? children(variant) : null
}
