'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useMessages } from 'next-intl'
import { useEffect } from 'react'

import LocaleProvider from '@/components/LocaleProvider'
import LayoutWithAnalytics from './LayoutWithAnalytics'
import AnalyticsScripts from '@/components/AnalyticsScripts'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import ExitPopup from '@/components/ExitPopup'
import useHotjar from '@/lib/hotjar'

export const metadataBase = new URL('https://techplay.vercel.app')

export default function LocaleLayout({ children, params: { locale } }) {
  useHotjar()
  const messages = useMessages()

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: window.location.pathname,
        })
      }
    } catch (e) {
      console.warn('Erreur Analytics (layout)', e)
    }
  }, [])

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className="bg-white text-black dark:bg-zinc-900 dark:text-white antialiased"
        suppressHydrationWarning
      >
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
