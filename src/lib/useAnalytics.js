// ✅ src/lib/useAnalytics.js
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Envoi d’un event page_view à chaque changement de route (SPA tracking)
    const gaID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    const pixelID = process.env.NEXT_PUBLIC_META_PIXEL_ID

    if (typeof window !== 'undefined') {
      if (gaID && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', { page_path: pathname })
      }

      if (pixelID && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView')
      }
    }
  }, [pathname])
}
