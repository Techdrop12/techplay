'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { pageview } from '@/lib/analytics'

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      pageview(pathname)
    }
  }, [pathname])

  return null
}
