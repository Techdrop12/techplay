'use client'

import { useEffect, useMemo, useState } from 'react'
import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'

type Props = {
  /** nom du test (clé de persistance / tracking) */
  name?: string
  /** liste des variants possibles */
  variants?: string[]
  /** TTL en jours pour l’assignation */
  ttlDays?: number
  /** libellés à afficher par variant (sinon le nom du variant) */
  labels?: Record<string, string>
  /** classes CSS supplémentaires */
  className?: string
}

export default function ABTestBanner({
  name = 'banner',
  variants = ['A', 'B'],
  ttlDays = 90,
  labels,
  className,
}: Props) {
  const [variant, setVariant] = useState<string | null>(null)

  // Choix du variant côté client (persisté)
  useEffect(() => {
    const v = getABVariant(name, variants, { ttlDays })
    setVariant(v)

    // Tracking (une seule fois à l'assignation)
    try {
      pushDataLayer({ event: 'ab_assign', ab_name: name, ab_variant: v })
      logEvent('ab_assign', { ab_name: name, ab_variant: v })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const label = useMemo(() => {
    if (!variant) return ''
    return labels?.[variant] ?? variant
  }, [labels, variant])

  if (!variant) return null

  return (
    <div
      className={
        className ??
        'bg-blue-100 text-blue-800 text-center py-2 text-sm'
      }
      data-ab-name={name}
      data-ab-variant={variant}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  )
}
