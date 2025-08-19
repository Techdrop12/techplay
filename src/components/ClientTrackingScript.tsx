'use client'

import { useEffect } from 'react'

interface ClientTrackingScriptProps {
  event: string
}

export default function ClientTrackingScript({ event }: ClientTrackingScriptProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', event)
    }
  }, [event])

  return null
}
