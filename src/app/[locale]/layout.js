'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useMessages } from 'next-intl'
import LocaleProvider from '@/components/LocaleProvider'
import '../../styles/globals.css'
import LayoutWithAnalytics from './LayoutWithAnalytics'
import AnalyticsScripts from '@/components/AnalyticsScripts'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import ExitPopup from '@/components/ExitPopup'
import useHotjar from '@/lib/hotjar'
import { useEffect } from 'react'

export default function LocaleLayout({ children, params: { locale } }) {
  useHotjar()
  const messages = useMessages()

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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider locale={locale}>
            <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
          </LocaleProvider>
          <AnalyticsScripts />
          <EmailCapturePopup />
          <ExitPopup />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
