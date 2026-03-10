'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useMemo } from 'react'

import { GA_TRACKING_ID, initAnalytics, pageview } from '@/lib/ga'

export default function Analytics() {
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()

  const href = useMemo(() => {
    const qs = searchParams?.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!GA_TRACKING_ID) return
    initAnalytics()
  }, [])

  useEffect(() => {
    if (!GA_TRACKING_ID) return
    pageview(href)
  }, [href])

  if (!GA_TRACKING_ID) return null

  return (
    <>
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />

      <Script id="gtag-bootstrap" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
        `}
      </Script>
    </>
  )
}