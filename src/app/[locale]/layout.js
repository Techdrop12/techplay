'use client'

import LocaleProvider from '../../../i18n'
import '../../styles/globals.css'
import LayoutWithAnalytics from './LayoutWithAnalytics'
import AnalyticsScripts from '@/components/AnalyticsScripts'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import ExitPopup from '@/components/ExitPopup'
import useHotjar from '@/lib/hotjar'
import { useEffect } from 'react'

export default function LocaleLayout({ children, params: { locale } }) {
  useHotjar()

  // Ajout tracking GA par page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: window.location.pathname,
      })
    }
  }, [])

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white antialiased">
        <LocaleProvider locale={locale}>
          <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
        </LocaleProvider>

        {/* Scripts tracking */}
        <AnalyticsScripts />

        {/* Popups conversion */}
        <EmailCapturePopup />
        <ExitPopup />
      </body>
    </html>
  )
}
