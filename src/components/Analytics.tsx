"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"
import { useEffect } from "react"

import { GA_TRACKING_ID, initAnalytics, pageview } from "@/lib/ga"

export default function Analytics() {
  const pathname = usePathname() || "/"
  const search = useSearchParams()
  const href = pathname + (search?.toString() ? `?${search!.toString()}` : "")

  // init GA après le chargement du tag
  useEffect(() => {
    if (!GA_TRACKING_ID) return
    initAnalytics({
      config: { send_page_view: false },
    })
  }, [])

  // pageview sur navigation SPA
  useEffect(() => {
    if (!GA_TRACKING_ID) return
    pageview(href)
  }, [href])

  if (!GA_TRACKING_ID) return null

  return (
    <>
      {/* Tag loader */}
      <Script id="gtag-src" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
      {/* Bootstrap gtag si besoin (dataLayer déjà créé dans le layout via Consent script) */}
      <Script id="gtag-bootstrap" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
          gtag('js', new Date());
        `}
      </Script>
    </>
  )
}
