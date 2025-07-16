'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function MetaPixel() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }
  }, [pathname])

  return null
}
