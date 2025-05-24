'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'

import { CartProvider } from '@/context/cartContext'
import { ThemeProvider } from '@/context/themeContext'
import { UpsellProvider } from '@/context/upsellContext'
import PushPermission from '@/components/PushPermission'

import { pageview, GA_ID } from '@/lib/ga4'
import useHotjar from '@/lib/hotjar'

export default function ClientWrapper({ children }) {
  const pathname = usePathname()
  useHotjar()

  useEffect(() => {
    if (GA_ID) pageview(pathname)
  }, [pathname])

  return (
    <ThemeProvider>
      <CartProvider>
        <UpsellProvider>
          {GA_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="gtag-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `}
              </Script>
            </>
          )}
          <PushPermission />
          {children}
          <Toaster position="top-right" />
        </UpsellProvider>
      </CartProvider>
    </ThemeProvider>
  )
}
