'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/cartContext'
import { ThemeProvider } from '@/context/themeContext' // contexte thème (dark/light)
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
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </ThemeProvider>
  )
}
