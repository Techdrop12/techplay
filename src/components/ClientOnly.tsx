'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

interface ClientOnlyProps<T extends Record<string, unknown>> {
  load: () => Promise<{ default: ComponentType<T> }>
  fallback?: React.ReactNode
  props: T
}

export default function ClientOnly<T extends Record<string, unknown>>({
  load,
  fallback,
  props,
}: ClientOnlyProps<T>) {
  const LazyComponent = dynamic(load, {
    ssr: false,
    loading: () => fallback || <p>Chargement…</p>,
  })

  return <LazyComponent {...props} />
}
